/**
 * TrackMan Golf Analyzer - App entry: DOM, validation, analysis flow
 * Depends: config.js (STORAGE_KEY, PROFILE_KEY), history.js (displayHistory), analysis.js (getAdjustedTargets, buildIssues, displayResults).
 */
var currentAnalysisData = null;

function loadProfile() {
    try {
        var savedProfile = localStorage.getItem(PROFILE_KEY);
        if (savedProfile) {
            var profile = JSON.parse(savedProfile);
            if (profile.name) document.getElementById('name').value = profile.name;
            if (profile.age) document.getElementById('age').value = profile.age;
            if (profile.handicap !== undefined) document.getElementById('handicap').value = profile.handicap;
            if (profile.rounds) document.getElementById('rounds').value = profile.rounds;
            if (profile.playerType) document.getElementById('playerType').value = profile.playerType;
        }
    } catch (e) {
        /* ignore corrupted profile */
    }
}

function saveProfile(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function validateInput(inputId, value, required) {
    if (required === undefined) required = false;
    var input = document.getElementById(inputId);
    if (required && (value === null || isNaN(value))) {
        input.classList.add('error');
        return false;
    }
    input.classList.remove('error');
    return true;
}

function handleClubChange() {
    var club = document.getElementById('club').value;
    var wedgeLoftContainer = document.getElementById('wedgeLoftContainer');
    var wedges = ['gw', 'sw', 'lw'];
    if (wedges.indexOf(club) !== -1) {
        wedgeLoftContainer.style.display = 'block';
        document.getElementById('wedgeLoft').required = true;
    } else {
        wedgeLoftContainer.style.display = 'none';
        document.getElementById('wedgeLoft').required = false;
        document.getElementById('wedgeLoft').value = '';
    }
}

function parseOptional(id) {
    var value = document.getElementById(id).value.trim();
    if (value === '' || value.toLowerCase() === 'na' || value.toLowerCase() === 'n/a') return null;
    return parseFloat(value);
}

function analyzeSwing() {
    var button = document.getElementById('analyzeBtn');
    button.disabled = true;
    var originalText = button.textContent;
    button.innerHTML = 'Analyzing... <span class="loading"></span>';
    setTimeout(function () {
        performAnalysis();
        button.disabled = false;
        button.textContent = originalText;
    }, 300);
}

function performAnalysis() {
    var club = document.getElementById('club').value;
    var wedges = ['gw', 'sw', 'lw'];
    var wedgeLoft = null;
    if (wedges.indexOf(club) !== -1) {
        wedgeLoft = parseFloat(document.getElementById('wedgeLoft').value);
        if (!validateInput('wedgeLoft', wedgeLoft, true)) {
            alert('Please enter the loft of your wedge');
            document.getElementById('wedgeLoft').focus();
            return;
        }
    }
    var profile = {
        name: document.getElementById('name').value.trim() || null,
        age: parseInt(document.getElementById('age').value, 10) || null,
        handicap: parseFloat(document.getElementById('handicap').value),
        rounds: parseInt(document.getElementById('rounds').value, 10) || null,
        playerType: document.getElementById('playerType').value
    };
    saveProfile(profile);
    if (!validateInput('handicap', profile.handicap, true)) {
        alert('Please enter your handicap index to get personalized analysis');
        document.getElementById('handicap').focus();
        return;
    }
    var smash = parseFloat(document.getElementById('smash').value);
    var launchAngle = parseFloat(document.getElementById('launchAngle').value);
    var spinRate = parseFloat(document.getElementById('spinRate').value);
    var isValid = true;
    isValid = validateInput('smash', smash, true) && isValid;
    isValid = validateInput('launchAngle', launchAngle, true) && isValid;
    isValid = validateInput('spinRate', spinRate, true) && isValid;
    if (!isValid) {
        alert('Please fill in all required fields: Smash Factor, Launch Angle, and Spin Rate');
        return;
    }
    var data = {
        smash: smash,
        launchAngle: launchAngle,
        spinRate: spinRate,
        faceToPath: parseOptional('faceToPath'),
        dynamicLoft: parseOptional('dynamicLoft'),
        aoa: parseOptional('aoa'),
        clubSpeed: parseOptional('clubSpeed'),
        ballSpeed: parseOptional('ballSpeed'),
        path: parseOptional('path'),
        face: parseOptional('face')
    };
    var targets = getAdjustedTargets(club, profile);
    var issues = buildIssues(data, targets, club, profile);
    currentAnalysisData = {
        club: club,
        wedgeLoft: wedgeLoft,
        profile: profile,
        data: data,
        issues: issues.slice(0, 2)
    };
    window.currentAnalysisData = currentAnalysisData;
    displayResults(issues.slice(0, 2), targets, club, data, profile);
    document.getElementById('sessionNotes').style.display = 'block';
}

document.addEventListener('DOMContentLoaded', function () {
    loadProfile();
    var inputs = document.querySelectorAll('input');
    inputs.forEach(function (input) {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') analyzeSwing();
        });
    });
});
