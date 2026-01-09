// Theme and video controls for the portfolio site
var myVideo;
var videoState = {
    isPlaying: false,
    currentSize: 'normal'
};

// Cursor following animation with fluid line-based trail
var cursorFollower = document.querySelector('.cursor-follower');
var canvas = document.getElementById('trailCanvas');
var ctx = canvas.getContext('2d');
var mouseX = 0;
var mouseY = 0;
var cursorX = 0;
var cursorY = 0;
var prevCursorX = 0;
var prevCursorY = 0;
var isFollowing = true;
var hueRotation = 0;
var idleRotation = 0;

// Trail system
var trailPoints = [];
var maxTrailLength = 50;
var trailLifespan = 800; // milliseconds

// Idle state
var isIdle = false;
var idleThreshold = 0.5; // Velocity threshold for idle

// Setup canvas
function setupCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
setupCanvas();
window.addEventListener('resize', setupCanvas);

// Bright neon rainbow colors
function getNeonRainbowColor(hue) {
    return 'hsl(' + hue + ', 100%, 50%)';
}

document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    if (!isFollowing) return;
    
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    if (cursorFollower) {
        cursorFollower.style.left = cursorX + 'px';
        cursorFollower.style.top = cursorY + 'px';
    }
    
    // Calculate velocity
    var velocityX = cursorX - prevCursorX;
    var velocityY = cursorY - prevCursorY;
    var velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    
    // Check if idle
    isIdle = velocity < idleThreshold;
    
    // Add position to trail only if moving
    if (velocity > 0.1) {
        trailPoints.push({
            x: cursorX,
            y: cursorY,
            hue: hueRotation,
            createdAt: Date.now()
        });
        
        // Remove old points
        var now = Date.now();
        trailPoints = trailPoints.filter(function(point) {
            return (now - point.createdAt) < trailLifespan;
        });
        
        // Keep max trail length
        if (trailPoints.length > maxTrailLength) {
            trailPoints.shift();
        }
    }
    
    prevCursorX = cursorX;
    prevCursorY = cursorY;
    
    hueRotation = (hueRotation + 2) % 360;
    idleRotation = (idleRotation + 3) % 360;
    
    // Clear and redraw
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (!isIdle && trailPoints.length > 0) {
        drawFluidTrail();
    } else if (isIdle) {
        drawIdleCircle();
    }
    
    requestAnimationFrame(animateCursor);
}

function drawFluidTrail() {
    if (trailPoints.length < 2) return;
    
    var now = Date.now();
    
    // Draw multiple flowing strands with gradient colors
    for (var strand = 0; strand < 5; strand++) {
        var isFirstPoint = true;
        
        // Different hue offset for each strand (72 degrees apart for 5 strands)
        var strandHueOffset = strand * 72;
        
        for (var i = 0; i < trailPoints.length - 1; i++) {
            var point = trailPoints[i];
            var nextPoint = trailPoints[i + 1];
            var timeElapsed = now - point.createdAt;
            var nextTimeElapsed = now - nextPoint.createdAt;
            var alpha = Math.max(0, 1 - (timeElapsed / trailLifespan));
            var nextAlpha = Math.max(0, 1 - (nextTimeElapsed / trailLifespan));
            
            // Offset each strand slightly perpendicular to movement
            var offsetX = Math.cos(strand * (Math.PI * 2 / 5) + (i * 0.1)) * (8 + strand * 3);
            var offsetY = Math.sin(strand * (Math.PI * 2 / 5) + (i * 0.1)) * (8 + strand * 3);
            var nextOffsetX = Math.cos(strand * (Math.PI * 2 / 5) + ((i + 1) * 0.1)) * (8 + strand * 3);
            var nextOffsetY = Math.sin(strand * (Math.PI * 2 / 5) + ((i + 1) * 0.1)) * (8 + strand * 3);
            
            var strandX = point.x + offsetX;
            var strandY = point.y + offsetY;
            var nextStrandX = nextPoint.x + nextOffsetX;
            var nextStrandY = nextPoint.y + nextOffsetY;
            
            // Line width decreases towards tail
            var lineWidth = (3.5 - strand * 0.6) * alpha;
            var nextLineWidth = (3.5 - strand * 0.6) * nextAlpha;
            
            // Create gradient color along the strand
            var progressInTrail = i / trailPoints.length;
            var colorShift = progressInTrail * 180;
            var currentHue = (point.hue + strandHueOffset + colorShift) % 360;
            var nextHue = (nextPoint.hue + strandHueOffset + colorShift) % 360;
            
            // Draw gradient line segment
            var gradient = ctx.createLinearGradient(strandX, strandY, nextStrandX, nextStrandY);
            gradient.addColorStop(0, getNeonRainbowColor(currentHue));
            gradient.addColorStop(1, getNeonRainbowColor(nextHue));
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = Math.max(0.5, lineWidth);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.globalAlpha = (alpha + nextAlpha) / 2 * 0.8;
            ctx.shadowColor = getNeonRainbowColor((currentHue + nextHue) / 2);
            ctx.shadowBlur = 20 * ((alpha + nextAlpha) / 2);
            
            ctx.beginPath();
            ctx.moveTo(strandX, strandY);
            ctx.lineTo(nextStrandX, nextStrandY);
            ctx.stroke();
        }
    }
    
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
}

function drawIdleCircle() {
    var radius = 8;
    var segments = 60;
    var segmentAngle = (Math.PI * 2) / segments;
    
    // Draw smooth spinning rainbow circle with cursor at center
    for (var i = 0; i < segments; i++) {
        var angle1 = (i * segmentAngle) + (idleRotation * Math.PI / 180);
        var angle2 = ((i + 1) * segmentAngle) + (idleRotation * Math.PI / 180);
        
        var x1 = cursorX + Math.cos(angle1) * radius;
        var y1 = cursorY + Math.sin(angle1) * radius;
        var x2 = cursorX + Math.cos(angle2) * radius;
        var y2 = cursorY + Math.sin(angle2) * radius;
        
        var hue = (i * (360 / segments) + idleRotation) % 360;
        
        ctx.strokeStyle = getNeonRainbowColor(hue);
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.85;
        ctx.shadowColor = getNeonRainbowColor(hue);
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
    
    ctx.globalAlpha = 1;
}

// Start cursor animation
animateCursor();

// Expand cursor on hover over interactive elements
document.addEventListener('mouseover', function(e) {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.classList.contains('icon-btn')) {
        if (cursorFollower) {
            cursorFollower.style.width = '36px';
            cursorFollower.style.height = '36px';
            cursorFollower.style.borderColor = 'var(--accent-hover)';
            cursorFollower.style.boxShadow = '0 0 20px rgba(99, 102, 241, 0.6), inset 0 0 12px rgba(99, 102, 241, 0.3)';
        }
    }
});

document.addEventListener('mouseout', function(e) {
    if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.classList.contains('icon-btn')) {
        if (cursorFollower) {
            cursorFollower.style.width = '24px';
            cursorFollower.style.height = '24px';
            cursorFollower.style.borderColor = 'var(--accent)';
            cursorFollower.style.boxShadow = '0 0 12px rgba(99, 102, 241, 0.4), inset 0 0 8px rgba(99, 102, 241, 0.2)';
        }
    }
});

// Zoom Object Redirect
// Zoom Object Redirect
var zoomAnimationEnabled = true;

function toggleZoomAnimation() {
    var zoomObj = document.querySelector('.zoom-object');
    var toggleBtn = document.querySelector('.zoom-toggle');
    
    zoomAnimationEnabled = !zoomAnimationEnabled;
    
    if (zoomAnimationEnabled) {
        // Resume animation
        zoomObj.style.animationPlayState = 'running';
        toggleBtn.textContent = '⏸';
        toggleBtn.classList.remove('paused');
    } else {
        // Pause animation
        zoomObj.style.animationPlayState = 'paused';
        toggleBtn.textContent = '▶';
        toggleBtn.classList.add('paused');
    }
}

function redirectToPage() {
    // Change this URL to the page you want to redirect to
    var zoomObj = document.querySelector('.zoom-object');
    if (zoomObj) {
        zoomObj.style.animation = 'none';
        zoomObj.style.background = 'linear-gradient(135deg, #10b981, #06b6d4)';
        zoomObj.style.boxShadow = '0 0 40px rgba(16, 185, 129, 0.8)';
    }
    setTimeout(function() {
        window.location.href = 'registration-site/index.html';
    }, 300);
}

function setTheme(dark) {
    var root = document.body;
    if (dark) {
        root.classList.add('dark-mode');
        localStorage.setItem('theme','dark');
        var icon = document.getElementById('themeIcon');
        if (icon) icon.src = 'images/2-1.png';
    } else {
        root.classList.remove('dark-mode');
        localStorage.setItem('theme','light');
        var icon = document.getElementById('themeIcon');
        if (icon) icon.src = 'images/1.png';
    }
}

function toggleTheme() {
    var isDark = document.body.classList.contains('dark-mode');
    setTheme(!isDark);
}

window.addEventListener('DOMContentLoaded', function() {
    // theme init from localStorage
    var saved = localStorage.getItem('theme');
    if (saved === 'dark') setTheme(true);
    else setTheme(false);

    // wire theme button
    var btn = document.getElementById('themeToggle');
    if (btn) btn.addEventListener('click', toggleTheme);

    // init video
    myVideo = document.getElementById('video1');
    if (myVideo) {
        myVideo.addEventListener('play', function() {
            videoState.isPlaying = true;
            updatePlayPauseButton();
        });
        myVideo.addEventListener('pause', function() {
            videoState.isPlaying = false;
            updatePlayPauseButton();
        });
        
        var p = myVideo.play();
        if (p !== undefined) p.catch(function(e){});
    }
});

// Update play/pause button appearance
function updatePlayPauseButton() {
    var playBtn = document.getElementById('playPauseBtn');
    if (playBtn) {
        playBtn.textContent = videoState.isPlaying ? '⏸ Pause' : '▶ Play';
        playBtn.setAttribute('aria-label', videoState.isPlaying ? 'Pause video' : 'Play video');
    }
}

// Video control functions
function playPause() {
    if (!myVideo) myVideo = document.getElementById('video1');
    if (myVideo) {
        if (myVideo.paused) {
            myVideo.play();
        } else {
            myVideo.pause();
        }
    }
}

function makeBig() {
    if (!myVideo) myVideo = document.getElementById('video1');
    if (myVideo) {
        addResizeAnimation();
        myVideo.style.width = '560px';
        videoState.currentSize = 'big';
        updateSizeButtons();
    }
}

function makeSmall() {
    if (!myVideo) myVideo = document.getElementById('video1');
    if (myVideo) {
        addResizeAnimation();
        myVideo.style.width = '320px';
        videoState.currentSize = 'small';
        updateSizeButtons();
    }
}

function makeNormal() {
    if (!myVideo) myVideo = document.getElementById('video1');
    if (myVideo) {
        addResizeAnimation();
        myVideo.style.width = '100%';
        videoState.currentSize = 'normal';
        updateSizeButtons();
    }
}

// Add smooth animation during resize
function addResizeAnimation() {
    if (!myVideo) return;
    myVideo.classList.add('resizing');
    setTimeout(function() {
        myVideo.classList.remove('resizing');
    }, 400);
}

// Update size button appearances
function updateSizeButtons() {
    var bigBtn = document.getElementById('bigBtn');
    var smallBtn = document.getElementById('smallBtn');
    var normalBtn = document.getElementById('normalBtn');
    
    // Remove active state from all
    if (bigBtn) bigBtn.classList.remove('active');
    if (smallBtn) smallBtn.classList.remove('active');
    if (normalBtn) normalBtn.classList.remove('active');
    
    // Add active state to current
    if (videoState.currentSize === 'big' && bigBtn) bigBtn.classList.add('active');
    if (videoState.currentSize === 'small' && smallBtn) smallBtn.classList.add('active');
    if (videoState.currentSize === 'normal' && normalBtn) normalBtn.classList.add('active');
}








