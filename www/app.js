(function () {
  const q = (sel) => document.querySelector(sel);
  const qa = (sel) => Array.from(document.querySelectorAll(sel));

  function getUserInput() {
    const selectedTypes = qa('input[name="aircon"]:checked').map(el => el.value);
    let totalCU = 0;
    let totalFCU = 0;

    selectedTypes.forEach(type => {
      if (type === 'vrv') {
        totalCU += parseInt(q('#qty_cu_vrv').value || '0', 10);
        totalFCU += parseInt(q('#qty_fcu_vrv').value || '0', 10);
      } else {
        const input = q(`#qty_fcu_${type}`);
        if (input) totalFCU += parseInt(input.value || '0', 10);
      }
    });

    return {
      aircons: selectedTypes,
      need: { cu: totalCU, fcu: totalFCU },
      categories: {
        daikin: q('#cat_daikin').checked,
        thirdParty: q('#cat_3rdparty').checked
      },
      features: {
        timer: q('#feat_timer').checked,
        touch: q('#feat_touch').checked,
        mobile: q('#feat_mobile').checked,
        web: q('#feat_web').checked,
        //voice: q('#feat_voice').checked // new feature add here also
      }
    };
  }
  // Secret access to analytics
  // Hidden access to analytics via the Logo
const logoTrigger = document.querySelector('.logo-icon');

if (logoTrigger) {
    // For Desktop/Laptop (Double Click)
    let clickCount = 0;

    logoTrigger.addEventListener('click', function() {
    clickCount++;
    
    if (clickCount === 5) {
        window.location.href = 'analytics.php';
        clickCount = 0;
    }
    
    // Reset after 2 seconds
    setTimeout(function() {
        clickCount = 0;
    }, 2000);
});

    // For Mobile/Tablet (Double Tap)
    let lastTap = 0;
    logoTrigger.addEventListener('touchend', function(e) {
        const currentTime = new Date().getTime();
        const tapLength = currentTime - lastTap;
        if (tapLength < 500 && tapLength > 0) {
            e.preventDefault(); // Prevents zooming
            window.location.href = 'analytics.php';
        }
        lastTap = currentTime;
    });
}
  function matches(controller, user) {
    if (user.aircons.length === 0) return { ok: false };

    // 1. Port Calculation
    const portsNeededByCU = Math.ceil(user.need.cu / controller.capacity.cu);
    const portsNeededByFCU = Math.ceil(user.need.fcu / controller.capacity.fcu);
    const totalPortsNeeded = Math.max(portsNeededByCU, portsNeededByFCU, 1);

    // 2. Limit Check
    if (!controller.isThirdParty && totalPortsNeeded > controller.maxPorts) return { ok: false };

    let needsExpansion = totalPortsNeeded > controller.capacity.f1f2;
    let expansionQty = 0;
    if (needsExpansion && controller.expansion) {
      expansionQty = Math.ceil((totalPortsNeeded - controller.capacity.f1f2) / controller.expansion.addF1F2);
    }

    // 3. Feature Filter (Ignore for 3rd Party)
    if (!controller.isThirdParty) {
      const hasFeatures = Object.entries(user.features).every(([feat, required]) => {
        if (!required) return true;
        return controller.features[feat] === true;
      });
      if (!hasFeatures) return { ok: false };
    }

    // 4. Compatibility
    const isCompatible = user.aircons.every(type => controller.compat[type]);
    if (!isCompatible) return { ok: false };

    return { ok: true, needsExpansion, expansionQty, totalPortsNeeded };
  }

  function renderResults(list, user) {
    const host = q('#results');
    //host.innerHTML = list.length ? "" : `<div class="card" style="text-align:center;">No matching solutions found.</div>`;
    const hasFeatures = Object.values(user.features).some(v => v);
    
    // Clear and add a friendly intro for the salesman
    host.innerHTML = "";
    
    if (list.length > 0) {
      const introText = hasFeatures 
        ? `<div class="sales-note">✅ Found ${list.length} solutions matching the specific features you requested.</div>`
        : `<div class="sales-note">✅ Showing all ${list.length} solutions that can handle this many units. (No specific features were requested).</div>`;
      host.insertAdjacentHTML('beforeend', introText);
    } else {
      host.innerHTML = `<div class="card" style="text-align:center; color: #d9534f;">
                          <strong>No solutions found for this combination.</strong><br>
                          Try unchecking some "Required Features" or checking the unit quantities.
                        </div>`;
      return;
    }

    list.forEach(item => {
      const isReiri = ["DCPF04", "DCPF01", "DCPH01", "DCPF05"].includes(item.model);
      const onlyRAWifi = user.aircons.length === 1 && user.aircons[0] === 'ra_wifi';
      const DTA116A51 = ["DTA116A51"].includes(item.model);
      const hasVRV = user.aircons.includes('vrv');

      // --- UNIT SUMMARY ---
      const airconParts = [];
      let totalCU = 0, totalFCU = 0;
      const types = { 
        'vrv': 'VRV', 'skyair_f1f2': 'SkyAir(F1/F2)', 'skyair_no_f1f2': 'SkyAir(No F1/F2)', 
        'ra_wifi': 'RA(Wifi)', 'ra_nowifi': 'RA(No Wifi)' 
      };

      user.aircons.forEach(type => {
        const fcu = parseInt(q(`#qty_fcu_${type}`)?.value || 0);
        if (type === 'vrv') {
          const cu = parseInt(q('#qty_cu_vrv').value || 0);
          airconParts.push(`VRV: ${cu} CU / ${fcu} FCU`);
          totalCU += cu; totalFCU += fcu;
        } else {
          airconParts.push(`${types[type]}: ${fcu} units`);
          totalFCU += fcu;
        }
      });

      // --- BACNET SCALING MATH (Corrected Pool logic) ---
      let numControllers = 1;
      let totalExpansionQty = item.match.expansionQty;
      let controllerLabel = item.model;

      if (item.id === 'bacnet') {
        const totalPortsNeeded = item.match.totalPortsNeeded; 
        numControllers = Math.ceil(totalPortsNeeded / 4); 
        const totalBuiltInPorts = numControllers * 2;
        const extraPortsNeeded = Math.max(0, totalPortsNeeded - totalBuiltInPorts);
        totalExpansionQty = Math.ceil(extraPortsNeeded / 2); 
        controllerLabel = `${numControllers} x ${item.model}`;
      }

      // --- EXPANSION LINE ---
      let expansionLine = "";
      if (totalExpansionQty > 0 || (item.match.needsExpansion && item.id !== 'bacnet')) {
        const qty = (item.id === 'bacnet') ? totalExpansionQty : item.match.expansionQty;
        if ((item.id === 'itm' || item.id === 'marutto' || item.id ==='itm_reiri') && item.expansion.baseModel) {
          expansionLine = qty === 1 
            ? `<div class="sol-line"><strong>Expansion Required for F1F2 :</strong> 1 x ${item.expansion.baseModel}</div>`
            : `<div class="sol-line"><strong>Expansion Required for F1F2 :</strong> ${item.expansion.baseModel} + ${qty - 1} x ${item.expansion.addModel}</div>`;
        } else if (item.expansion) {
          expansionLine = `<div class="sol-line"><strong>Expansion Required for F1F2 :</strong> ${qty} x ${item.expansion.model}</div>`;
        }
      }

      // --- ADAPTERS LIST ---
      let adaptersArray = [];
      user.aircons.forEach(type => {
        const qty = parseInt(q(`#qty_fcu_${type}`)?.value || 0);
        if (qty > 0) {
          if (item.id === 'dry_contact') {
             adaptersArray.push(`<li><strong>${qty} x ${item.adapters[type]}</strong> - for ${types[type]}</li>`);
          } else if (!(isReiri && onlyRAWifi) && (type === 'skyair_no_f1f2' || type.startsWith('ra_'))) {
             let label = (type === 'ra_wifi') ? ` (Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card.` : "";
             adaptersArray.push(`<li><strong>${qty} x ${item.adapters[type]}</strong>${label} - for ${qty}x${types[type]}</li>`);
          }
        }
      });
      let adaptersHtml = adaptersArray.length > 0 
        ? `<div class="sol-line"><strong>Additional Adapter:</strong><ul style="margin: 5px 0; padding-left: 20px;">${adaptersArray.join('')}</ul></div>` : "";

      // --- REIRI ADAPTER LOGIC ---
      let reiriContentHtml = "";
      if (isReiri && onlyRAWifi) {
        const raQty = parseInt(q('#qty_fcu_ra_wifi').value || 0);
        const reiriQty = Math.max(Math.ceil(raQty / 64), 1);
        reiriContentHtml = `
          <div class="sol-line"><strong>--- Wireless Solution ---</strong></div>
          <div class="sol-line" style="margin-left: 15px;">Use built-in Dmobile Adapter</div>
          <div class="sol-line" style="margin-top: 10px;"><strong>--- Wired Solution ---</strong></div>
          <div class="sol-line" style="margin-left: 15px;"><strong>Reiri Adapter:</strong> ${reiriQty} x DCPA01</div>
          <div class="sol-line" style="margin-left: 15px;"><strong>Required Adapters:</strong> ${raQty} x KRP928BB2S (Certain RA models require BRP067A42.)</div>
          <div class="warning-box" style="margin-left: 15px; margin-top: 10px;">
            <strong>Required additional Centralize Controller for D3net address holding :</strong>
            <br>DCS302C51 or DCS301B61 or DCS601C51 or DCM601B51
          </div>
          `;
      } else if (isReiri) {
        const reiriQty = Math.max(Math.ceil(totalCU / 7), Math.ceil(totalFCU / 64), 1);
        reiriContentHtml = `<div class="sol-line"><strong>Reiri Adapter:</strong> ${reiriQty} x DCPA01</div>`;
      }

      // --- ADDRESS HOLDING WARNING (Unified for Reiri and 3rd Party) ---
      let addressHoldingWarning = "";
      if (!hasVRV && !onlyRAWifi) {
        if (isReiri || DTA116A51) {
           const note = DTA116A51 ? "Need one per per16xFCUs" : "If all selected FCUs have Dmobile Adapter, may not need this.";
           addressHoldingWarning = `
            <div class="warning-box" style="margin-top:10px; border: 1px solid #d9534f; padding: 10px; border-radius: 4px;">
              <strong>Required additional Centralize Controller for D3net address holding :</strong>
              <br>DCS302C51 or DCS301B61 or DCS601C51 or DCM601B51
              <br><small>Note: ${note}</small>
            </div>`;
        }
      }

      const html = `
        <div class="result-card" style="position: relative; min-height: 150px;">
          <h2 class="sol-title">${item.solution} system</h2>
          <h3><strong>Feature :</strong> ${Object.entries(item.features).filter(([_,v])=>v).map(([k])=>item.featureDisplay[k]||k).join(", ")}</h3>

          <div class="sol-line" style="margin-top:10px;"><strong>Unit Summary:</strong><br>${airconParts.join("<br>")}</div>
          <div class="sol-line"><strong>Total CU: ${totalCU} , Total FCU : ${totalFCU}</strong></div>
          <div class="sol-line highlight" style="margin-top:15px;"><strong>Required devices for System:</strong></div>
          <div class="sol-line"><strong>Controller Model :</strong> ${controllerLabel}</div>
          ${reiriContentHtml}
          ${expansionLine}
          ${adaptersHtml}
          ${addressHoldingWarning}
          <div style="margin-top: 10px; display: flex; gap: 10px; flex-wrap: wrap;">
            <button class="copy-btn" onclick="copyRequirements(this)">📋 Copy Requirements</button>
            <button class="view-image-btn" onclick="viewImage('images/${item.model}.jpg', '${item.model}')">📷View Image</button>
          </div>
          <div class="sol-line notes" style="margin-top:15px;"><strong>Notes :</strong> ${item.notes || "N/A"}</div>
        </div>
          `;
      host.insertAdjacentHTML('beforeend', html);
    });
  }
  // Copy button 
window.copyRequirements = function(btn) {
  const card = btn.closest('.result-card');
  const allLines = Array.from(card.querySelectorAll('.sol-line, .warning-box, .notes'));
  
  const title = card.querySelector('.sol-title').innerText.trim();
  const featureElement = card.querySelector('h3');
  const featureLine = featureElement ? featureElement.innerText.trim() : "";

  const summaryLines = allLines
    .filter(el => {
      const txt = el.innerText;
      const isUnitLine = txt.includes("CU") || txt.includes("units") || txt.includes("FCU");
      const isWarning = txt.includes("Required") || txt.includes("Controller") || txt.includes("Note:");
      return isUnitLine && !isWarning;
    })
    .map(el => el.innerText.replace('Unit Summary:', '').trim())
    .join("\n");

  let deviceList = [];
  let seenTexts = new Set();
  let startCollecting = false;

  allLines.forEach(el => {
    const text = el.innerText.trim();
    if (text.includes("Required devices for System:")) {
      startCollecting = true;
      return; 
    }
    if (startCollecting && text !== "") {
      if (!seenTexts.has(text)) {
        deviceList.push(text);
        seenTexts.add(text);
      }
    }
  });

  const textToCopy = `${title}
${featureLine}

Unit Summary:
-------------
${summaryLines}

Required devices for System:
---------------------------
${deviceList.join("\n\n")}`;

  // --- UNIVERSAL COPY LOGIC ---
  if (navigator.clipboard && window.isSecureContext) {
    // Modern way (for localhost/HTTPS)
    navigator.clipboard.writeText(textToCopy).then(() => {
      updateButtonText(btn);
    });
  } else {
    // Older way (for Local Network IP addresses)
    const textArea = document.createElement("textarea");
    textArea.value = textToCopy;
    textArea.style.position = "fixed"; // Avoid scrolling to bottom
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      updateButtonText(btn);
    } catch (err) {
      alert('Unable to copy. Please use HTTPS or localhost.');
    }
    document.body.removeChild(textArea);
  }

  function updateButtonText(button) {
    const originalText = button.innerText;
    button.innerText = "✅ Copied!";
    setTimeout(() => button.innerText = originalText, 2000);
  }
};
//end copy sessiton 

  // --- UI INITIALIZATION & EVENT LISTENERS ---
  const featuresSection = q('#features-section');
  const radioDaikin = q('#cat_daikin');
  const radio3rdParty = q('#cat_3rdparty');

  function updateFeaturesVisibility() {
    if (radio3rdParty.checked) {
      featuresSection.classList.add('hidden');
    } else {
      featuresSection.classList.remove('hidden');
    }
  }

  radioDaikin.addEventListener('change', updateFeaturesVisibility);
  radio3rdParty.addEventListener('change', updateFeaturesVisibility);

  qa('input[type="number"]').forEach(input => {
    input.addEventListener('keydown', (e) => { if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault(); });
    input.addEventListener('input', (e) => {
      const row = e.target.closest('.aircon-row');
      const checkbox = row.querySelector('input[name="aircon"]');
      if (parseInt(e.target.value) > 0) checkbox.checked = true;
    });
  });

  qa('input[name="aircon"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      if (!e.target.checked) {
        const row = e.target.closest('.aircon-row');
        row.querySelectorAll('input[type="number"]').forEach(input => input.value = "");
      }
    });
  });

  q('#btnFind').onclick = () => {
    const user = getUserInput();
      // --- NEW: Validation Logic ---
  const airconTypes = ['vrv', 'skyair_f1f2', 'skyair_no_f1f2', 'ra_wifi', 'ra_nowifi'];
  let validationError = "";
  airconTypes.forEach(type => {
    const isChecked = q(`input[value="${type}"]`).checked;
    const fcuQty = parseInt(q(`#qty_fcu_${type}`)?.value || 0);
    const cuQty = (type === 'vrv') ? parseInt(q('#qty_cu_vrv').value || 0) : 0;
    // Case 1: Checked but no quantity
    if (isChecked && fcuQty === 0 && (type !== 'vrv' || cuQty === 0)) {
        validationError = `Please enter a quantity for the checked ${type.replace('_', ' ')} unit.`;
    }
  });
  if (validationError) {
      alert(validationError); // You can replace this with a nicer Toast or Modal
      return; // Stop the search if validation fails
  }
  // --- End Validation ---

    const results = CONTROLLERS.map(c => ({...c, match: matches(c, user)}))
      .filter(x => {
        if (!x.match.ok) return false;
        if (user.categories.daikin && x.isThirdParty) return false;
        if (user.categories.thirdParty && !x.isThirdParty) return false;
        return true;
      });
    renderResults(results, user);
    q('#results').scrollIntoView({ behavior: 'smooth' });
  };

  q('#btnReset').onclick = () => location.reload();

})();

// View Image function for mobile
window.viewImage = function(imageSrc, modelName) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  const content = document.createElement('div');
  content.style.cssText = `
    position: relative;
    max-width: 90%;
    max-height: 90%;
    background: white;
    padding: 20px;
    border-radius: 12px;
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '✕ Close';
  closeBtn.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: #ef4444;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    z-index: 10000;
  `;
  closeBtn.onclick = () => document.body.removeChild(modal);
  
  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = modelName;
  img.style.cssText = `
    width: 100%;
    height: auto;
    max-height: 70vh;
    object-fit: contain;
    display: block;
    margin-top: 40px;
  `;
  img.onerror = () => {
    content.innerHTML = '<p style="padding: 40px; text-align: center; color: #666;">Image not available</p>';
  };
  
  const title = document.createElement('h3');
  title.textContent = modelName;
  title.style.cssText = `
    margin: 10px 0;
    color: #0066cc;
    text-align: center;
  `;
  
  content.appendChild(closeBtn);
  content.appendChild(title);
  content.appendChild(img);
  modal.appendChild(content);
  
  modal.onclick = (e) => {
    if (e.target === modal) document.body.removeChild(modal);
  };
  
  document.body.appendChild(modal);
};
