/**
 * TrackMan Golf Analyzer - Session history (localStorage + UI)
 * Depends: config.js (STORAGE_KEY). Used by: app.js (currentAnalysisData), analysis.js (smoothScrollTo from here).
 */
function escapeHtml(str) {
    if (str == null || str === '') return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getHistory() {
    if (window.currentUser && window.CLOUD_STORAGE_ENABLED) {
        return window.loadSessionsFromCloud();
    }
    try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return Promise.resolve(raw ? JSON.parse(raw) : []);
    } catch (e) {
        return Promise.resolve([]);
    }
}

function saveSession() {
    if (!window.currentAnalysisData) {
        alert('Please analyze your swing first before saving.');
        return;
    }
    var notes = document.getElementById('notesInput').value.trim();
    var session = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        club: window.currentAnalysisData.club,
        wedgeLoft: window.currentAnalysisData.wedgeLoft,
        profile: window.currentAnalysisData.profile,
        data: window.currentAnalysisData.data,
        issues: window.currentAnalysisData.issues,
        notes: notes
    };
    if (window.currentUser && window.CLOUD_STORAGE_ENABLED) {
        window.saveSessionToCloud(session).then(function (success) {
            if (success) {
                alert('✅ Session saved to cloud successfully!');
                document.getElementById('notesInput').value = '';
                if (document.getElementById('historySection').style.display !== 'none') {
                    displayHistory();
                }
            }
        });
        return;
    }
    try {
        getHistory().then(function (history) {
            history.unshift(session);
            var limited = history.slice(0, 50);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
            alert('✅ Session saved locally! Sign in to save to the cloud.');
            document.getElementById('notesInput').value = '';
            if (document.getElementById('historySection').style.display !== 'none') {
                displayHistory();
            }
        });
    } catch (e) {
        alert('❌ Error saving session: ' + (e.message || e));
    }
}

function toggleHistory() {
    var historySection = document.getElementById('historySection');
    if (historySection.style.display === 'none') {
        historySection.style.display = 'block';
        displayHistory();
        smoothScrollTo(historySection);
    } else {
        historySection.style.display = 'none';
    }
}

function getClubDisplayName(club, wedgeLoft) {
    var clubNames = {
        'driver': 'Driver',
        '3wood': '3 Wood',
        '5wood': '5 Wood',
        '3iron': '3 Iron',
        '4iron': '4 Iron',
        '5iron': '5 Iron',
        '6iron': '6 Iron',
        '7iron': '7 Iron',
        '8iron': '8 Iron',
        '9iron': '9 Iron',
        'pw': 'Pitching Wedge',
        'gw': 'Gap Wedge',
        'sw': 'Sand Wedge',
        'lw': 'Lob Wedge'
    };
    var baseName = clubNames[club] || club;
    if (wedgeLoft && ['gw', 'sw', 'lw'].indexOf(club) !== -1) {
        return baseName + ' (' + wedgeLoft + '°)';
    }
    return baseName;
}

function displayHistory(filter) {
    if (filter === undefined) filter = 'all';
    var historyContent = document.getElementById('historyContent');
    getHistory().then(function (history) {
        if (history.length === 0) {
            historyContent.innerHTML = '<p style="text-align: center; color: #666; padding: 40px 20px;">No sessions saved yet. Complete your first analysis to start tracking progress!</p>';
            return;
        }
        var filteredHistory = filter === 'all' ? history : history.filter(function (s) { return s.club === filter; });
        if (filteredHistory.length === 0) {
            historyContent.innerHTML = '<p style="text-align: center; color: #666; padding: 40px 20px;">No sessions found for this club.</p>';
            return;
        }
        var html = '';
        filteredHistory.forEach(function (session) {
            var date = new Date(session.timestamp);
            var dateStr = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            var clubName = getClubDisplayName(session.club, session.wedgeLoft);
            var firestoreIdAttr = session.firestoreId ? ' data-firestore-id="' + escapeHtml(session.firestoreId) + '"' : '';
            html += '<div class="history-item">';
            html += '<div class="history-item-header"><div class="history-item-title">' + escapeHtml(clubName) + '</div><div class="history-item-date">' + escapeHtml(dateStr) + '</div></div>';
            html += '<div class="history-metrics">';
            html += '<div class="history-metric"><strong>Smash:</strong> ' + session.data.smash.toFixed(2) + '</div>';
            html += '<div class="history-metric"><strong>Launch:</strong> ' + session.data.launchAngle.toFixed(1) + '°</div>';
            html += '<div class="history-metric"><strong>Spin:</strong> ' + Math.round(session.data.spinRate) + '</div>';
            if (session.data.aoa !== null) {
                html += '<div class="history-metric"><strong>AoA:</strong> ' + (session.data.aoa > 0 ? '+' : '') + session.data.aoa.toFixed(1) + '°</div>';
            }
            html += '</div>';
            if (session.issues && session.issues.length > 0) {
                html += '<div style="margin-top: 8px; padding: 8px; background: #fff3cd; border-radius: 4px; font-size: 13px;"><strong style="color: #856404;">Top Issue:</strong> <span style="color: #856404;">' + escapeHtml(session.issues[0].title) + '</span></div>';
            }
            if (session.notes) {
                html += '<div class="history-notes"><strong>Notes:</strong> ' + escapeHtml(session.notes) + '</div>';
            }
            html += '<button class="delete-session-btn" data-session-id="' + session.id + '"' + firestoreIdAttr + ' onclick="deleteSession(parseInt(this.dataset.sessionId, 10), this.dataset.firestoreId || \'\')">Delete Session</button>';
            html += '</div>';
        });
        historyContent.innerHTML = html;
    });
}

function filterHistory() {
    var filter = document.getElementById('historyClubFilter').value;
    displayHistory(filter);
}

function deleteSession(id, firestoreId) {
    if (!confirm('Are you sure you want to delete this session?')) return;
    if (window.currentUser && window.CLOUD_STORAGE_ENABLED && firestoreId) {
        window.deleteSessionFromCloud(firestoreId).then(function () {
            displayHistory(document.getElementById('historyClubFilter').value);
        });
        return;
    }
    getHistory().then(function (history) {
        var updatedHistory = history.filter(function (s) { return s.id !== id; });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
        displayHistory(document.getElementById('historyClubFilter').value);
    });
}

function clearHistory() {
    if (!confirm('Are you sure you want to delete ALL session history? This cannot be undone.')) return;
    if (window.currentUser && window.CLOUD_STORAGE_ENABLED) {
        window.clearAllSessionsFromCloud().then(function () {
            document.getElementById('historyClubFilter').value = 'all';
            displayHistory('all');
        });
        return;
    }
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById('historyClubFilter').value = 'all';
    displayHistory('all');
}

function smoothScrollTo(element) {
    if (element) {
        if ('scrollBehavior' in document.documentElement.style) {
            element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            element.scrollIntoView(false);
        }
    }
}
