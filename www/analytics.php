<?php
// Analytics Dashboard for HVAC Tool
// Tracks usage with daily, weekly, and monthly views
// Reads ALL Apache log files including rotated .gz files
// NOW WITH: Operating System Detection

$logDir = '/var/log/apache2/';
$logBaseName = 'access.log';

// ===== GET ALL LOG FILES =====
function getAllLogFiles($logDir, $logBaseName) {
    $files = [];
    
    // Get all access.log* files
    $pattern = $logDir . $logBaseName . '*';
    $allFiles = glob($pattern);
    
    // Sort files: access.log, access.log.1, access.log.2.gz, etc.
    usort($allFiles, function($a, $b) {
        // Extract numbers from filenames
        preg_match('/access\.log(?:\.(\d+))?/', $a, $matchA);
        preg_match('/access\.log(?:\.(\d+))?/', $b, $matchB);
        
        $numA = isset($matchA[1]) ? (int)$matchA[1] : -1;
        $numB = isset($matchB[1]) ? (int)$matchB[1] : -1;
        
        return $numA - $numB;
    });
    
    return $allFiles;
}

// ===== READ LOG FILE (supports .gz) =====
function readLogFile($filepath) {
    $lines = [];
    
    if (!file_exists($filepath)) {
        return $lines;
    }
    
    // Check if file is gzipped
    if (substr($filepath, -3) === '.gz') {
        $gz = gzopen($filepath, 'r');
        if ($gz) {
            while (!gzeof($gz)) {
                $line = gzgets($gz);
                if ($line !== false) {
                    $lines[] = $line;
                }
            }
            gzclose($gz);
        }
    } else {
        // Regular file
        $lines = file($filepath);
    }
    
    return $lines;
}

// ===== DETECT OS FROM USER AGENT =====
function detectOS($userAgent) {
    // iOS (iPhone, iPad, iPod)
    if (preg_match('/iPhone|iPad|iPod/', $userAgent)) {
        return 'iOS';
    }
    // Android
    if (preg_match('/Android/', $userAgent)) {
        return 'Android';
    }
    // Windows
    if (preg_match('/Windows NT/', $userAgent)) {
        return 'Windows';
    }
    // macOS
    if (preg_match('/Macintosh|Mac OS X/', $userAgent)) {
        return 'macOS';
    }
    // Linux
    if (preg_match('/Linux/', $userAgent)) {
        return 'Linux';
    }
    // Unknown/Bot
    return 'Other';
}

// ===== DETECT DEVICE TYPE =====
function detectDeviceType($userAgent) {
    if (preg_match('/Mobile|iPhone|iPad|iPod|Android/', $userAgent)) {
        return 'Mobile';
    }
    return 'Desktop';
}

// ===== DATA COLLECTION FROM ALL LOG FILES =====
function getAnalyticsData($logDir, $logBaseName) {
    $data = [
        'daily' => [],
        'weekly' => [],
        'monthly' => [],
        'hourly' => [],
        'os' => [],
        'device' => []
    ];
    
    $oneYearAgo = strtotime('-1 year');
    $currentDate = date('Y-m-d');
    
    // Get all log files
    $logFiles = getAllLogFiles($logDir, $logBaseName);
    
    foreach ($logFiles as $logFile) {
        $lines = readLogFile($logFile);
        
        foreach ($lines as $line) {
            // Only count actual page visits
            if (strpos($line, 'GET /index.html') === false && strpos($line, 'GET / ') === false) {
                continue;
            }
            
            // Parse Apache Log Date: [13/Feb/2026:10:00:00 +0800]
            if (preg_match('/\[(\d{2}\/\w{3}\/\d{4}):(\d{2}:\d{2}:\d{2})/', $line, $matches)) {
                $datePart = $matches[1]; // 13/Feb/2026
                $timePart = $matches[2]; // 10:00:00
                
                // Convert "13/Feb/2026" to "13-Feb-2026" so strtotime reads it correctly
                $normalizedDate = str_replace('/', '-', $datePart);
                $timestamp = strtotime($normalizedDate . ' ' . $timePart);
                
                if (!$timestamp || $timestamp < $oneYearAgo) continue;
                
                // Daily data
                $dateKey = date('Y-m-d', $timestamp);
                $data['daily'][$dateKey] = ($data['daily'][$dateKey] ?? 0) + 1;
                
                // Weekly data
                $weekKey = date('Y-W', $timestamp);
                $data['weekly'][$weekKey] = ($data['weekly'][$weekKey] ?? 0) + 1;
                
                // Monthly data
                $monthKey = date('Y-m', $timestamp);
                $data['monthly'][$monthKey] = ($data['monthly'][$monthKey] ?? 0) + 1;
                
                // Hourly data (Today only)
                if ($dateKey === $currentDate) {
                    $hourKey = date('H', $timestamp);
                    $data['hourly'][$hourKey] = ($data['hourly'][$hourKey] ?? 0) + 1;
                }
                
                // Extract User-Agent
                if (preg_match('/"([^"]*)"[^"]*$/', $line, $uaMatch)) {
                    $userAgent = $uaMatch[1];
                    
                    // Detect OS
                    $os = detectOS($userAgent);
                    $data['os'][$os] = ($data['os'][$os] ?? 0) + 1;
                    
                    // Detect Device Type
                    $device = detectDeviceType($userAgent);
                    $data['device'][$device] = ($data['device'][$device] ?? 0) + 1;
                }
            }
        }
    }
    
    return $data;
}

// Get analytics data from all log files
$analytics = getAnalyticsData($logDir, $logBaseName);

// Get current stats
$today = date('Y-m-d');
$thisWeek = date('Y-W');
$thisMonth = date('Y-m');

$todayHits = $analytics['daily'][$today] ?? 0;
$weekHits = $analytics['weekly'][$thisWeek] ?? 0;
$monthHits = $analytics['monthly'][$thisMonth] ?? 0;

// Calculate totals
$totalHits = array_sum($analytics['daily']);
$avgDaily = count($analytics['daily']) > 0 ? round($totalHits / count($analytics['daily']), 1) : 0;

// OS Statistics
$totalOS = array_sum($analytics['os']);
$osPercentages = [];
foreach ($analytics['os'] as $os => $count) {
    $osPercentages[$os] = $totalOS > 0 ? round(($count / $totalOS) * 100, 1) : 0;
}

// Device Statistics
$totalDevices = array_sum($analytics['device']);
$devicePercentages = [];
foreach ($analytics['device'] as $device => $count) {
    $devicePercentages[$device] = $totalDevices > 0 ? round(($count / $totalDevices) * 100, 1) : 0;
}

// Get last 30 days for chart
$last30Days = [];
for ($i = 29; $i >= 0; $i--) {
    $date = date('Y-m-d', strtotime("-$i days"));
    $last30Days[$date] = $analytics['daily'][$date] ?? 0;
}

// Get last 12 weeks
$last12Weeks = [];
for ($i = 11; $i >= 0; $i--) {
    $week = date('Y-W', strtotime("-$i weeks"));
    $last12Weeks[$week] = $analytics['weekly'][$week] ?? 0;
}

// Get last 12 months
$last12Months = [];
for ($i = 11; $i >= 0; $i--) {
    $month = date('Y-m', strtotime("-$i months"));
    $last12Months[$month] = $analytics['monthly'][$month] ?? 0;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HVAC Tool Analytics Dashboard</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 20px;
            min-height: 100vh;
        }
        
        .dashboard {
            max-width: 1400px;
            margin: 0 auto;
        }
        
        .header {
            background: white;
            padding: 30px;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #0066cc;
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .header p {
            color: #64748b;
            font-size: 1rem;
        }
        
        .info-box {
            background: #e0f2fe;
            border-left: 4px solid #0284c7;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        
        .info-box p {
            color: #075985;
            font-size: 0.95rem;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
            border-left: 4px solid #0066cc;
            transition: transform 0.2s;
        }
        
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px rgba(0,0,0,0.12);
        }
        
        .stat-card.success { border-left-color: #10b981; }
        .stat-card.warning { border-left-color: #f59e0b; }
        .stat-card.info { border-left-color: #3b82f6; }
        .stat-card.purple { border-left-color: #8b5cf6; }
        
        .stat-label {
            font-size: 0.875rem;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
        }
        
        .stat-value {
            font-size: 2.5rem;
            font-weight: 700;
            color: #1e293b;
            font-family: 'JetBrains Mono', monospace;
        }
        
        .stat-change {
            font-size: 0.875rem;
            color: #10b981;
            margin-top: 8px;
        }
        
        .os-breakdown {
            margin-top: 15px;
            font-size: 0.875rem;
        }
        
        .os-item {
            display: flex;
            justify-content: space-between;
            padding: 5px 0;
            color: #475569;
        }
        
        .os-name {
            font-weight: 500;
        }
        
        .os-percent {
            font-family: 'JetBrains Mono', monospace;
            color: #0066cc;
            font-weight: 600;
        }
        
        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            flex-wrap: wrap;
        }
        
        .tab {
            padding: 12px 24px;
            background: white;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
            transition: all 0.2s;
        }
        
        .tab:hover {
            border-color: #0066cc;
            background: #f0f9ff;
        }
        
        .tab.active {
            background: #0066cc;
            color: white;
            border-color: #0066cc;
        }
        
        .chart-container {
            display: none;
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        .chart-container.active {
            display: block;
        }
        
        .chart-title {
            color: #1e293b;
            font-size: 1.25rem;
            margin-bottom: 20px;
            font-weight: 600;
        }
        
        .two-column-charts {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .small-chart-container {
            background: white;
            padding: 25px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .stat-value {
                font-size: 2rem;
            }
            
            .header h1 {
                font-size: 1.5rem;
            }
            
            .two-column-charts {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>📊 HVAC Tool Analytics Dashboard</h1>
            <p>Usage statistics and trends for the Control Solution Configurator</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-label">Today's Visits</div>
                <div class="stat-value"><?php echo number_format($todayHits); ?></div>
                <div class="stat-change">📅 <?php echo date('l, M d, Y'); ?></div>
            </div>
            
            <div class="stat-card success">
                <div class="stat-label">This Week</div>
                <div class="stat-value"><?php echo number_format($weekHits); ?></div>
                <div class="stat-change">📆 Week <?php echo date('W'); ?></div>
            </div>
            
            <div class="stat-card warning">
                <div class="stat-label">This Month</div>
                <div class="stat-value"><?php echo number_format($monthHits); ?></div>
                <div class="stat-change">📆 <?php echo date('F Y'); ?></div>
            </div>
            
            <div class="stat-card info">
                <div class="stat-label">Average Daily</div>
                <div class="stat-value"><?php echo number_format($avgDaily, 1); ?></div>
                <div class="stat-change">📈 Last 30 days</div>
            </div>
        </div>
        
        <!-- OS & Device Stats -->
        <div class="two-column-charts">
            <div class="small-chart-container">
                <h3 class="chart-title">💻 Operating Systems..</h3>
                <canvas id="osChart"></canvas>
                <div class="os-breakdown">
                    <?php 
                    arsort($osPercentages);
                    foreach ($osPercentages as $os => $percent): 
                        if ($percent > 0):
                    ?>
                    <div class="os-item">
                        <span class="os-name"><?php echo $os; ?></span>
                        <span class="os-percent"><?php echo $percent; ?>%</span>
                    </div>
                    <?php 
                        endif;
                    endforeach; 
                    ?>
                </div>
            </div>
            
            <div class="small-chart-container">
                <h3 class="chart-title">📱 Device Types</h3>
                <canvas id="deviceChart"></canvas>
                <div class="os-breakdown">
                    <?php 
                    arsort($devicePercentages);
                    foreach ($devicePercentages as $device => $percent): 
                        if ($percent > 0):
                    ?>
                    <div class="os-item">
                        <span class="os-name"><?php echo $device; ?></span>
                        <span class="os-percent"><?php echo $percent; ?>%</span>
                    </div>
                    <?php 
                        endif;
                    endforeach; 
                    ?>
                </div>
            </div>
        </div>
        
        <div class="tabs">
            <div class="tab active" onclick="showChart('daily')">📅 Daily (30 Days)</div>
            <div class="tab" onclick="showChart('weekly')">📆 Weekly (12 Weeks)</div>
            <div class="tab" onclick="showChart('monthly')">📊 Monthly (12 Months)</div>
            <div class="tab" onclick="showChart('hourly')">🕐 Hourly (Today)</div>
        </div>
        
        <!-- Daily Chart -->
        <div class="chart-container active" id="chart-daily">
            <h3 class="chart-title">Daily Visits - Last 30 Days</h3>
            <canvas id="dailyChart"></canvas>
        </div>
        
        <!-- Weekly Chart -->
        <div class="chart-container" id="chart-weekly">
            <h3 class="chart-title">Weekly Visits - Last 12 Weeks</h3>
            <canvas id="weeklyChart"></canvas>
        </div>
        
        <!-- Monthly Chart -->
        <div class="chart-container" id="chart-monthly">
            <h3 class="chart-title">Monthly Visits - Last 12 Months</h3>
            <canvas id="monthlyChart"></canvas>
        </div>
        
        <!-- Hourly Chart -->
        <div class="chart-container" id="chart-hourly">
            <h3 class="chart-title">Hourly Visits - Today</h3>
            <canvas id="hourlyChart"></canvas>
        </div>
    </div>
    
    <script>
        // OS Chart (Doughnut)
        const osData = <?php echo json_encode(array_values($analytics['os'])); ?>;
        const osLabels = <?php echo json_encode(array_keys($analytics['os'])); ?>;
        
        new Chart(document.getElementById('osChart'), {
            type: 'doughnut',
            data: {
                labels: osLabels,
                datasets: [{
                    data: osData,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',   // iOS - Blue
                        'rgba(34, 197, 94, 0.8)',    // Android - Green
                        'rgba(0, 102, 204, 0.8)',    // Windows - Dark Blue
                        'rgba(139, 92, 246, 0.8)',   // macOS - Purple
                        'rgba(245, 158, 11, 0.8)',   // Linux - Orange
                        'rgba(148, 163, 184, 0.8)'   // Other - Gray
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Device Chart (Pie)
        const deviceData = <?php echo json_encode(array_values($analytics['device'])); ?>;
        const deviceLabels = <?php echo json_encode(array_keys($analytics['device'])); ?>;
        
        new Chart(document.getElementById('deviceChart'), {
            type: 'pie',
            data: {
                labels: deviceLabels,
                datasets: [{
                    data: deviceData,
                    backgroundColor: [
                        'rgba(16, 185, 129, 0.8)',   // Mobile - Green
                        'rgba(139, 92, 246, 0.8)'    // Desktop - Purple
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percent = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percent}%)`;
                            }
                        }
                    }
                }
            }
        });
        
        // Chart.js configuration
        const chartConfig = {
            type: 'bar',
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(0, 102, 204, 0.9)',
                        padding: 12,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13 }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 },
                        grid: { color: 'rgba(0, 0, 0, 0.05)' }
                    },
                    x: {
                        grid: { display: false }
                    }
                }
            }
        };
        
        // Daily Chart
        const dailyData = <?php echo json_encode(array_values($last30Days)); ?>;
        const dailyLabels = <?php echo json_encode(array_keys($last30Days)); ?>.map(d => {
            const date = new Date(d);
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        });
        
        new Chart(document.getElementById('dailyChart'), {
            ...chartConfig,
            data: {
                labels: dailyLabels,
                datasets: [{
                    label: 'Visits',
                    data: dailyData,
                    backgroundColor: 'rgba(0, 102, 204, 0.8)',
                    borderColor: 'rgba(0, 102, 204, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            }
        });
        
        // Weekly Chart
        const weeklyData = <?php echo json_encode(array_values($last12Weeks)); ?>;
        const weeklyLabels = <?php echo json_encode(array_keys($last12Weeks)); ?>.map(w => 'Week ' + w.split('-')[1]);
        
        new Chart(document.getElementById('weeklyChart'), {
            ...chartConfig,
            data: {
                labels: weeklyLabels,
                datasets: [{
                    label: 'Visits',
                    data: weeklyData,
                    backgroundColor: 'rgba(16, 185, 129, 0.8)',
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            }
        });
        
        // Monthly Chart
        const monthlyData = <?php echo json_encode(array_values($last12Months)); ?>;
        const monthlyLabels = <?php echo json_encode(array_keys($last12Months)); ?>.map(m => {
            const [year, month] = m.split('-');
            const date = new Date(year, month - 1);
            return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        });
        
        new Chart(document.getElementById('monthlyChart'), {
            ...chartConfig,
            data: {
                labels: monthlyLabels,
                datasets: [{
                    label: 'Visits',
                    data: monthlyData,
                    backgroundColor: 'rgba(245, 158, 11, 0.8)',
                    borderColor: 'rgba(245, 158, 11, 1)',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            }
        });
        
        // Hourly Chart
        const hourlyRawData = <?php echo json_encode($analytics['hourly']); ?>;
        const hourlyData = Array.from({length: 24}, (_, i) => hourlyRawData[i.toString().padStart(2, '0')] || 0);
        const hourlyLabels = Array.from({length: 24}, (_, i) => i + ':00');
        
        new Chart(document.getElementById('hourlyChart'), {
            type: 'line',
            data: {
                labels: hourlyLabels,
                datasets: [{
                    label: 'Visits',
                    data: hourlyData,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'rgba(59, 130, 246, 0.9)',
                        padding: 12
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { precision: 0 }
                    }
                }
            }
        });
        
        // Tab switching
        function showChart(type) {
            // Update tabs
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
            
            // Update charts
            document.querySelectorAll('.chart-container').forEach(chart => chart.classList.remove('active'));
            document.getElementById('chart-' + type).classList.add('active');
        }
    </script>
</body>
</html>
