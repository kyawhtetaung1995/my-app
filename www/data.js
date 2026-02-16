// data.js — full dataset from reference table
const CONTROLLERS = [
  {
    id: "united-onoff",
    solution: "Unified ON/OFF",
    model: "DCS301B61",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { physical_button: true, timer: false, touch: false, mobile: false, web: false },
    featureDisplay: {physical_button: "On/Off button",timer: "Timer Schedule",touch: "Touch Panel",mobile: "Mobile App",web: "Web Browser Control"},
    capacity: { f1f2: 1, cu: 7, fcu: 16 },
    maxPorts: 1, // cannot be expanded
    expansion: null,
    notes: "Note for unified on/off",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card. ",
      ra_nowifi: "KRP928BB2S" 
    }
  },
  {
    id: "united-onoff-with-timer",
    solution: "Unified ON/OFF With Timer",
    model: "DCS301B61 + DST301B61",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { physical_button: true,timer: true, touch: false, mobile: false, web: false },
    featureDisplay: {physical_button: "On/Off button",timer: "Timer Schedule",touch: "Touch Panel",mobile: "Mobile App",web: "Web Browser Control"},
    capacity: { f1f2: 1, cu: 7, fcu: 16 },
    maxPorts: 1, // cannot be expanded
    expansion: null,
    notes: "Notes for unified on/off",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card.",
      ra_nowifi: "KRP928BB2S" 
    }
  },
  {
    id: "crc",
    solution: "CRC",
    model: "DCS302C51",
    modelWithTimer: "DCS302C51 + DST301B61",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { physical_button: true, timer: false, touch: false, mobile: false, web: false },
    featureDisplay: {physical_button: "On/Off button",timer: "Timer Schedule",touch: "Touch Panel",mobile: "Mobile App",web: "Web Browser Control"},
    capacity: { f1f2: 1, cu: 7, fcu: 64 },
    maxPorts: 1, // cannot be expanded
    expansion: null,
    notes: "Notes for CRC",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card. ",
      ra_nowifi: "KRP928BB2S"
    }
  },
  {
    id: "crc-with-timer",
    solution: "CRC WITH TIMER",
    model: "DCS302C51 + DST301B61",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { physical_button: true, timer: true, touch: false, mobile: false, web: false },
    featureDisplay: {physical_button: "On/Off button",timer: "Timer Schedule",touch: "Touch Panel",mobile: "Mobile App",web: "Web Browser Control"},
    capacity: { f1f2: 1, cu: 7, fcu: 64 },
    maxPorts: 1, // cannot be expanded
    expansion: null,
    notes: "Notes for CRC",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card. ",
      ra_nowifi: "KRP928BB2S"
    }
  },
  {
    id: "simple-touch",
    solution: "SIMPLE TOUCH CONTROLLER",
    model: "DTP401A61 + DTP401A66 (power adapter)",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { timer: true, touch: true, mobile: false, web: false },
    featureDisplay: {timer: "Timer Schedule",touch: "Touch Panel",mobile: "Mobile App",web: "Web Browser Control"},
    capacity: { f1f2: 1, cu: 7, fcu: 64 },
    maxPorts: 1, // cannot be expanded
    expansion: null,
    notes: "Notes for Simple Touch Controller",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card. ",
      ra_nowifi: "KRP928BB2S"
    }
  },
  {
    id: "itc",
    solution: "ITC",
    model: "DCS601C51",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { timer: true, touch: true, mobile: false, web: false },
    featureDisplay: {timer: "Timer Schedule",touch: "Touch Panel",mobile: "Mobile App",web: "Web Browser Control"},
    capacity: { f1f2: 1, cu: 7, fcu: 64 },
    maxPorts: 2, // 1 built-in + 1 expansion max (Total 14 CU)
    expansion: { model: "DCS601A52", addF1F2: 1 },
    notes: "Notes for ITC",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card. ",
      ra_nowifi: "KRP928BB2S" 
    }
  },
  {
    id: "itm",
    solution: "ITM",
    model: "DCM601B51",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { timer: true, touch: true, mobile: false, web: false },
    featureDisplay: {timer: "Timer Schedule",touch: "Touch Panel",mobile: "Mobile App",web: "Web Browser Control"},
    capacity: { f1f2: 1, cu: 7, fcu: 64 },
    maxPorts: 8, // 1 built-in + 7 extra ports (Total 56 CU)
    expansion: { baseModel: "DGE601A52", addModel: "DGE601A53", addF1F2: 1 },
    notes: "Notes for ITM",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card. ",
      ra_nowifi: "KRP928BB2S" 
    }
  },
  {
    id: "reiri-office-touch",
    solution: "Reiri Office Touch",
    model: "DCPF04",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { timer: true, touch: true, mobile: true, web: true },
    featureDisplay: {timer: "Timer Schedule",touch: "Touch Panel",mobile: "Reiri Mobile App",web: "Reiri Window App"},
    capacity: { f1f2: 2, cu: 7, fcu: 64 },
    maxPorts: 2, // Reiri is fixed at 2 ports
    expansion: null,
    notes: "DCPF04 must have LAN connection with client's router/switch for Mobile/Window App",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) or Use built-in Dmobile Adapter",
      ra_nowifi: "KRP928BB2S or Add-on Dmobile Adapter"
    }
  },
  {
    id: "reiri-office",
    solution: "Reiri Office",
    model: "DCPF01",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { timer: true, touch: false, mobile: true, web: true },
    featureDisplay: {timer: "Timer Schedule",touch: "Touch Panel",mobile: "Reiri Mobile App",web: "Reiri Window App"},
    capacity: { f1f2: 2, cu: 7, fcu: 64 },
    maxPorts: 2, // Reiri is fixed at 2 ports
    expansion: null,
    notes: "DCPF01 must have LAN connection with client's router/switch for Mobile/Window App",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) or Use built-in Dmobile Adapter",
      ra_nowifi: "KRP928BB2S or Add-on Dmobile Adapter"
    }
  },
  {
    id: "reiri-home",
    solution: "Reiri Home",
    model: "DCPH01",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { timer: true, touch: false, mobile: true, web: true, voice: true }, //new feature add here
    featureDisplay: {timer: "Timer Schedule",touch: "Touch Panel",mobile: "Reiri Mobile App",web: "Reiri Window App", voice:"Voice Control"}, //new feature add here
    capacity: { f1f2: 1, cu: 7, fcu: 64 },
    maxPorts: 1, // Reiri Home is fixed at 1 port
    expansion: null,
    notes: "DCPH01 requires a LAN connection to the client’s router or switch to use the Mobile App and Windows App.",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) or Use built-in Dmobile Adapter",
      ra_nowifi: "KRP928BB2S or Add-on Dmobile Adapter"
    }
  },
  {
    id: "marutto",
    solution: "Marutto",
    model: "DGE601A51",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { timer: true, touch: false, mobile: false, web: true },
    featureDisplay: {timer: "Timer Schedule",touch: "Touch Panel",mobile: "Mobile App",web: "Web Browser Control"},
    capacity: { f1f2: 2, cu: 7, fcu: 64 },
    maxPorts: 8, // 2 built-in + 6 extra ports (Total 56 CU)
    expansion: { baseModel: "DGE601A52", addModel: "DGE601A53", addF1F2: 1 },
    notes: "DGE601A51 requires an internet connection for web browser control.",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card.",
      ra_nowifi: "KRP928BB2S" 
    }
  },
  {
    id: "itc_reiri",
    solution: "ITC + Reiri Office",
    model: "DCS601C51 + DCM007C51(iTC Web Interface software) + DCPF01(Reiri Office)",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { timer: true, touch: true, mobile: true, web: true },
    featureDisplay: {timer: "Timer Schedule",touch: "Touch Panel",mobile: "Mobile App",web: "Web Browser Control"},
    capacity: { f1f2: 1, cu: 7, fcu: 64 },
    maxPorts: 2, // 1 built-in + 1 expansion max (Total 14 CU)
    expansion: { model: "DCS601A52", addF1F2: 1 },
    notes: "ITC and Reiri must be connected to the same network via LAN cable.",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card. ",
      ra_nowifi: "KRP928BB2S" 
    }
  },
  {
    id: "itm_reiri",
    solution: "ITM + Reiri Office",
    model: "DCM601B51 + DCM007A51(iTM Web Interface software) + DCPF01(Reiri Office)",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { timer: true, touch: true, mobile: true, web: true },
    featureDisplay: {timer: "Timer Schedule",touch: "Touch Panel",mobile: "Mobile App",web: "Web Browser Control"},
    capacity: { f1f2: 1, cu: 7, fcu: 64 },
    maxPorts: 8, // 1 built-in + 7 extra ports (Total 56 CU)
    expansion: { baseModel: "DGE601A52", addModel: "DGE601A53", addF1F2: 1 },
    notes: "ITC and Reiri must be connected to the same network via LAN cable.",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card. ",
      ra_nowifi: "KRP928BB2S" 
    }
  },
  {
    id: "reiri_plus",
    solution: "Reiri Office Plus",
    model: "DCPF05",
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { timer: true, touch: false, mobile: true, web: true },
    featureDisplay: {timer: "Timer Schedule",touch: "Touch Panel",mobile: "Reiri Mobile App",web: "Reiri Window App"},
    capacity: { f1f2: 0, cu: 7, fcu: 64 },
    maxPorts: 10, // Reiri is fixed at 2 ports
    expansion: { model: "DCPF01", addF1F2: 2 },
    notes: "All controllers must be connected to the same network via LAN cable.",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) or Use built-in Dmobile Adapter",
      ra_nowifi: "KRP928BB2S or Add-on Dmobile Adapter"
    }
  },
  //3rd Party devices
  {
    id: "bacnet",
    solution: "3rd Party (BACnet)",
    model: "DMS502B51",
    isThirdParty: true,
    compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
    features: { bacnet:true, timer: false, touch: false, mobile: false, web: false },
    featureDisplay: {bacnet:"BACnet/IP protocol for 3rd Party",timer: "Timer Schedule",touch: "Touch Panel",mobile: "Mobile App",web: "Web Browser Control"},
    capacity: { f1f2: 2, cu: 7, fcu: 64 },
    maxPorts: 4, // 2 built-in + 2 extra ports (Total 28 CU)
    expansion: { model: "DAM411B51", addF1F2: 2 }, // Set to 1 to count each extra port
    notes: "Salesman to obtain the IP address format from the client for BACnet configuration before delivery to site.",
    adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card.",
      ra_nowifi: "KRP928BB2S" 
    }
  },
{
  id: "modbus-adapter", // Use a unique ID for 3rd party
  solution: "3rd Party (Modbus)",
  isThirdParty: true,
  model: "DTA116A51", 
  compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
  features: {modbus:"true",timer: false, touch: false, mobile: false, web: false, voice: false },
  featureDisplay: { modbus:"Modbus RTU protocol for 3rd Party",timer: "Timer Schedule", touch: "Touch Panel", mobile: "Mobile App", web: "Web Control" },
  capacity: { f1f2: 0, cu: 7, fcu: 16 },
  maxPorts: Infinity,
  expansion: { model: "DTA116A51", addF1F2: 1 },
  notes: "1x DTA116A51 adapter for maximun (7xCU 16xFCU)",
  adapters: { 
      skyair_no_f1f2: "DTA112BA51/52", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card.",
      ra_nowifi: "KRP928BB2S" 
    }
  },
  {
  id: "dry_contact", // Use a unique ID for 3rd party
  solution: "3rd Party (dry-contact status/control)",
  isThirdParty: true,
  model: "KRPX..Adapter", 
  compat: { vrv: true, skyair_f1f2: true, skyair_no_f1f2: true, ra_wifi: true, ra_nowifi: true },
  features: {dry_contact:true, modbus:false,timer: false, touch: false, mobile: false, web: false, voice: false },
  featureDisplay: { dry_contact:"Dry-contact for FCU (run/trip status,on/off control)",modbus:"Modbus RTU protocol for 3rd Party",timer: "Timer Schedule", touch: "Touch Panel", mobile: "Mobile App", web: "Web Control" },
  capacity: { f1f2: Infinity, cu: Infinity, fcu: Infinity},
  maxPorts: Infinity,
  expansion: null,
  notes: "Notes here",
  adapters: { 
      vrv: "KRP4AA51/52/53/54/55",
      skyair_f1f2:"KRP4AA51/52/53/54/55, *For FAFC model use KRP413BB1S or KRP928BB2S",
      skyair_no_f1f2: "KRP4AA51/52/53/54/55, *For FAFC model use KRP413BB1S or KRP928BB2S", 
      ra_wifi: "KRP928BB2S(Certain RA models require BRP067A42.) Remove built-in RA Wi-Fi card.",
      ra_nowifi: "KRP928BB2S" 
    }
  }
];
