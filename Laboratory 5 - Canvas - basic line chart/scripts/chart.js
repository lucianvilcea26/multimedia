window.onload = function() {
    let canvas = document.getElementById('chartCanvas');
    let ctx = canvas.getContext('2d');
    let tooltip = document.getElementById('tooltip');
    let statsDiv = document.getElementById('seriesStats');
    
    let series = [
        { data: [], color: '#4CAF50', name: 'S1' },
        { data: [], color: '#F44336', name: 'S2' },
        { data: [], color: '#2196F3', name: 'S3' }
    ];
    
    let intervalId, speed = 1000, valueInc = 20;

    function getVal(v) { return canvas.height - v; }

    function drawGrid() {
        if (!document.getElementById('gridToggle').checked) return;
        ctx.strokeStyle = document.body.classList.contains('dark') ? '#444' : (document.body.classList.contains('highContrast') ? '#0f0' : '#ddd');
        ctx.fillStyle = ctx.strokeStyle;
        ctx.lineWidth = 1;
        ctx.font = '10px Arial';
        for (let i = 0; i <= canvas.width; i += 150) {
            ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, canvas.height); ctx.stroke();
            ctx.fillText(i, i + 5, canvas.height - 5);
        }
        for (let i = 0; i <= canvas.height; i += 100) {
            ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(canvas.width, i); ctx.stroke();
            ctx.fillText(canvas.height - i, 5, i - 5);
        }
    }

    function drawChart() {
        let type = document.getElementById('chartType').value;
        let smooth = document.getElementById('smoothToggle').checked;
        
        series.forEach(s => {
            ctx.strokeStyle = s.color;
            ctx.fillStyle = s.color + '44';
            ctx.lineWidth = 3;
            
            if (type === 'bar') {
                s.data.forEach((v, i) => ctx.fillRect(i * valueInc, getVal(v), valueInc - 4, v));
            } else if (type === 'scatter') {
                s.data.forEach((v, i) => { ctx.beginPath(); ctx.arc(i * valueInc, getVal(v), 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); });
            } else {
                ctx.beginPath();
                ctx.moveTo(0, getVal(s.data[0]));
                for (let i = 1; i < s.data.length; i++) {
                    let x = i * valueInc, y = getVal(s.data[i]);
                    if (smooth) {
                        let prevX = (i - 1) * valueInc, prevY = getVal(s.data[i - 1]);
                        ctx.bezierCurveTo(prevX + valueInc / 2, prevY, x - valueInc / 2, y, x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                if (type === 'area') {
                    ctx.lineTo((s.data.length - 1) * valueInc, canvas.height);
                    ctx.lineTo(0, canvas.height);
                    ctx.closePath();
                    ctx.fill();
                }
                ctx.stroke();
            }
        });
    }

    function updateStats() {
        statsDiv.innerHTML = series.map(s => {
            let last = s.data[s.data.length - 1], min = Math.min(...s.data), max = Math.max(...s.data);
            let avg = (s.data.reduce((a, b) => a + b, 0) / s.data.length).toFixed(1);
            let trend = last > s.data[s.data.length - 2] ? '↑' : '↓';
            return `<div style="color:${s.color}"><b>${s.name}</b>: ${last} ${trend}<br>Min: ${min} Max: ${max} Avg: ${avg}</div>`;
        }).join('<hr>');
    }

    function generateData() {
        let min = parseInt(document.getElementById('minValue').value) || 0;
        let max = parseInt(document.getElementById('maxValue').value) || canvas.height;
        series.forEach(s => {
            if (s.data.length === 0) {
                for (let i = 0; i <= canvas.width; i += valueInc) s.data.push(Math.floor(Math.random() * (max - min) + min));
            } else {
                s.data.push(Math.floor(Math.random() * (max - min) + min));
                s.data.shift();
            }
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawGrid();
        drawChart();
        updateStats();
    }

    function start() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => { generateData(); draw(); }, speed);
    }

    document.getElementById('startPauseBtn').onclick = function() {
        if (intervalId) { clearInterval(intervalId); intervalId = null; this.textContent = 'Start'; }
        else { start(); this.textContent = 'Pause'; }
    };
    document.getElementById('resetBtn').onclick = () => { series.forEach(s => s.data = []); generateData(); draw(); };
    document.getElementById('exportBtn').onclick = () => {
        let link = document.createElement('a');
        link.download = 'chart.png';
        link.href = canvas.toDataURL();
        link.click();
    };
    document.getElementById('speedRange').oninput = function() { speed = 2100 - parseInt(this.value); if (intervalId) start(); };
    document.getElementById('themeSelect').onchange = function() { document.body.className = this.value; draw(); };
    
    ['gridToggle', 'smoothToggle', 'chartType'].forEach(id => {
        document.getElementById(id).onchange = draw;
    });
    
    canvas.onmousemove = (e) => {
        let rect = canvas.getBoundingClientRect(), x = e.clientX - rect.left, y = e.clientY - rect.top;
        let idx = Math.round(x / valueInc);
        if (idx >= 0 && idx < series[0].data.length) {
            tooltip.style.display = 'block';
            tooltip.style.left = (e.pageX + 10) + 'px';
            tooltip.style.top = (e.pageY + 10) + 'px';
            tooltip.innerHTML = series.map(s => `<div style="color:${s.color}">${s.name}: ${s.data[idx]}</div>`).join('');
        }
    };
    canvas.onmouseleave = () => tooltip.style.display = 'none';

    generateData(); draw(); start();
}