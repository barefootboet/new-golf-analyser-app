/**
 * TrackMan Golf Analyzer - Analysis logic and results display
 * Depends: config.js (clubTargets), history.js (smoothScrollTo).
 */
function getSkillLevel(profile) {
    if (profile.playerType === 'professional') return 'Tour Professionals';
    if (profile.playerType === 'teaching') return 'Teaching Professionals';
    if (profile.playerType === 'competitive') return 'Competitive Amateurs';
    if (profile.handicap <= 0) return 'Scratch Golfers';
    if (profile.handicap <= 5) return 'Single-Digit Handicappers';
    if (profile.handicap <= 10) return '5-10 Handicappers';
    if (profile.handicap <= 15) return '10-15 Handicappers';
    if (profile.handicap <= 20) return '15-20 Handicappers';
    return '20+ Handicappers';
}

function getAdjustedTargets(club, profile) {
    var baseTargets = clubTargets[club];
    var adjusted = JSON.parse(JSON.stringify(baseTargets));
    var skillFactor = 1.0;
    if (profile.playerType === 'professional') {
        skillFactor = 1.0;
    } else if (profile.playerType === 'teaching') {
        skillFactor = 0.95;
    } else if (profile.playerType === 'competitive') {
        skillFactor = Math.max(0.7, 1.0 - (profile.handicap / 20));
    } else {
        skillFactor = Math.max(0.5, 1.0 - (profile.handicap / 25));
    }
    var smashRange = baseTargets.smash.max - baseTargets.smash.min;
    adjusted.smash = {
        min: baseTargets.smash.min - (1.0 - skillFactor) * smashRange * 0.8,
        max: baseTargets.smash.max,
        optimal: baseTargets.smash.optimal - (1.0 - skillFactor) * smashRange * 0.5
    };
    if (club === 'driver') {
        if (profile.playerType === 'professional' || profile.playerType === 'teaching') {
            adjusted.launchAngle = { min: 9, max: 13, optimal: 11 };
        } else if (profile.handicap <= 0) {
            adjusted.launchAngle = { min: 9.5, max: 13, optimal: 11.2 };
        } else if (profile.handicap <= 4) {
            adjusted.launchAngle = { min: 10, max: 13, optimal: 11.2 };
        } else if (profile.handicap <= 8) {
            adjusted.launchAngle = { min: 10, max: 13.5, optimal: 11.5 };
        } else if (profile.handicap <= 12) {
            adjusted.launchAngle = { min: 10.5, max: 14, optimal: 11.9 };
        } else if (profile.handicap <= 16) {
            adjusted.launchAngle = { min: 11, max: 14.5, optimal: 12.3 };
        } else if (profile.handicap <= 20) {
            adjusted.launchAngle = { min: 11.5, max: 15, optimal: 12.6 };
        } else {
            adjusted.launchAngle = { min: 11, max: 15, optimal: 12.5 };
        }
    }
    if (club === 'driver') {
        if (profile.playerType === 'professional' || profile.playerType === 'teaching') {
            adjusted.spinRate = { min: 2000, max: 2800, optimal: 2400 };
        } else if (profile.handicap <= 0) {
            adjusted.spinRate = { min: 2100, max: 3000, optimal: 2500 };
        } else if (profile.handicap <= 4) {
            adjusted.spinRate = { min: 2200, max: 3100, optimal: 2650 };
        } else if (profile.handicap <= 8) {
            adjusted.spinRate = { min: 2300, max: 3300, optimal: 2800 };
        } else if (profile.handicap <= 12) {
            adjusted.spinRate = { min: 2400, max: 3500, optimal: 2900 };
        } else if (profile.handicap <= 16) {
            adjusted.spinRate = { min: 2500, max: 3600, optimal: 3000 };
        } else if (profile.handicap <= 20) {
            adjusted.spinRate = { min: 2500, max: 3700, optimal: 3100 };
        } else {
            adjusted.spinRate = { min: 2600, max: 3800, optimal: 3200 };
        }
    }
    adjusted.faceToPath = { max: 3 + (1.0 - skillFactor) * 12 };
    if (club === 'driver') {
        if (profile.playerType === 'professional' || profile.playerType === 'teaching') {
            adjusted.aoa = { min: -2, max: 5, optimal: 1 };
        } else if (profile.handicap <= 0) {
            adjusted.aoa = { min: -1.5, max: 5, optimal: 1.5 };
        } else if (profile.handicap <= 4) {
            adjusted.aoa = { min: -1, max: 5, optimal: 2 };
        } else if (profile.handicap <= 8) {
            adjusted.aoa = { min: 0, max: 5, optimal: 2.5 };
        } else if (profile.handicap <= 12) {
            adjusted.aoa = { min: 0, max: 5, optimal: 3 };
        } else if (profile.handicap <= 16) {
            adjusted.aoa = { min: 0, max: 5, optimal: 3 };
        } else if (profile.handicap <= 20) {
            adjusted.aoa = { min: 0, max: 5, optimal: 3.5 };
        } else {
            adjusted.aoa = { min: 0, max: 5, optimal: 4 };
        }
    }
    return adjusted;
}

function getTypicalAverages(club, profile) {
    var averages = {};
    if (club === 'driver') {
        if (profile.playerType === 'professional' || profile.playerType === 'teaching') {
            averages.launchAngle = 11.0;
            averages.spinRate = 2400;
            averages.aoa = -0.9;
        } else if (profile.handicap <= 0) {
            averages.launchAngle = 11.2;
            averages.spinRate = 2896;
            averages.aoa = -0.9;
        } else if (profile.handicap <= 4) {
            averages.launchAngle = 11.2;
            averages.spinRate = 2900;
            averages.aoa = -1.0;
        } else if (profile.handicap <= 8) {
            averages.launchAngle = 11.5;
            averages.spinRate = 2987;
            averages.aoa = -1.1;
        } else if (profile.handicap <= 12) {
            averages.launchAngle = 11.9;
            averages.spinRate = 3192;
            averages.aoa = -1.2;
        } else if (profile.handicap <= 16) {
            averages.launchAngle = 12.3;
            averages.spinRate = 3250;
            averages.aoa = -1.5;
        } else if (profile.handicap <= 20) {
            averages.launchAngle = 12.6;
            averages.spinRate = 3275;
            averages.aoa = -1.8;
        } else if (profile.handicap <= 24) {
            averages.launchAngle = 12.5;
            averages.spinRate = 3200;
            averages.aoa = -2.0;
        } else {
            averages.launchAngle = 12.1;
            averages.spinRate = 3127;
            averages.aoa = -2.1;
        }
    }
    return averages;
}

function buildIssues(data, targets, club, profile) {
    var issues = [];
    var skillLevel = getSkillLevel(profile);
    if (data.smash < targets.smash.min) {
        issues.push({
            priority: 1,
            title: 'Low Smash Factor - Poor Contact',
            problem: 'Your smash factor is ' + data.smash.toFixed(2) + ', but ' + skillLevel + ' should be around ' + targets.smash.optimal.toFixed(2) + ' (range: ' + targets.smash.min.toFixed(2) + '-' + targets.smash.max.toFixed(2) + "). You're losing distance due to off-center hits.",
            fix: 'Focus on hitting the center of the clubface. Try the "impact tape" drill or foot powder spray to see your strike pattern. Work on consistent contact before worrying about swing mechanics. Even a 0.02 improvement in smash factor can add 4-6 yards.'
        });
    }
    if (data.faceToPath !== null && Math.abs(data.faceToPath) > targets.faceToPath.max) {
        issues.push({
            priority: 1,
            title: 'Face to Path Issue - Excessive Curve',
            problem: 'Your face to path is ' + (data.faceToPath > 0 ? '+' : '') + data.faceToPath.toFixed(1) + '°. For ' + skillLevel + ', you want this closer to 0° (within ±' + targets.faceToPath.max + '°). This creates excessive curve on your shots (' + (data.faceToPath > 0 ? 'slice/fade' : 'hook/draw') + ').',
            fix: data.faceToPath > 0
                ? 'Your face is too open relative to path. Try: (1) Stronger grip - rotate both hands more to the right (for righties), (2) Focus on rotating the clubface closed through impact, (3) Check your wrist angles at the top.'
                : 'Your face is too closed relative to path. Try: (1) Weaker grip - rotate hands more to the left (for righties), (2) Feel like you\'re "holding off" the release through impact, (3) Keep the clubface more square to the arc.'
        });
    }
    if (data.launchAngle < targets.launchAngle.min || data.launchAngle > targets.launchAngle.max) {
        var tooLow = data.launchAngle < targets.launchAngle.min;
        var diagnosis = '';
        if (data.dynamicLoft !== null && data.aoa !== null) {
            var expectedLaunch = data.dynamicLoft + (data.aoa * 0.5);
            if (Math.abs(expectedLaunch - data.launchAngle) > 3) {
                diagnosis = ' Your dynamic loft and attack angle suggest something else is affecting launch (possibly strike location on the face).';
            }
        } else if (data.dynamicLoft !== null) {
            if (tooLow && data.dynamicLoft < targets.launchAngle.optimal - 5) {
                diagnosis = ' Your dynamic loft is also low, indicating you may be delofting at impact with excessive forward shaft lean.';
            } else if (!tooLow && data.dynamicLoft > targets.launchAngle.optimal + 3) {
                diagnosis = ' Your dynamic loft is high, indicating you may be adding loft (flipping/scooping) at impact.';
            }
        } else if (data.aoa !== null) {
            if (club === 'driver' && tooLow && data.aoa < 0) {
                diagnosis = ' Your negative attack angle is contributing to the low launch.';
            }
        }
        issues.push({
            priority: 2,
            title: (tooLow ? 'Low' : 'High') + ' Launch Angle',
            problem: 'Your launch angle is ' + data.launchAngle.toFixed(1) + '°. For ' + skillLevel + ', optimal is ' + targets.launchAngle.min + '-' + targets.launchAngle.max + '° with ' + club + '.' + diagnosis,
            fix: tooLow
                ? (club === 'driver' ? 'Driver fixes: (1) Tee it higher - ball should be half above the crown, (2) Move ball forward - off your lead heel, (3) Widen your stance and tilt your spine away from target at address, (4) Feel like you\'re hitting "up" on the ball.' : 'Iron fixes: (1) Check ball position - should be center to slightly forward, (2) Reduce forward shaft lean at impact, (3) Ensure you\'re not trapping it too much, (4) Swing more around your body rather than down.')
                : (club === 'driver' ? 'Driver fixes: (1) Lower tee height slightly, (2) Move ball back 1-2 inches, (3) Reduce upper body tilt away from target, (4) Feel more "through" the ball rather than "up" at it. You may also be flipping at impact.' : 'Iron fixes: (1) Ball position may be too far forward, (2) Add slight forward shaft lean, (3) Make sure you\'re compressing the ball, not scooping it, (4) Lead with your hands through impact.')
        });
    }
    if (data.spinRate < targets.spinRate.min || data.spinRate > targets.spinRate.max) {
        var tooLowSpin = data.spinRate < targets.spinRate.min;
        issues.push({
            priority: 2,
            title: (tooLowSpin ? 'Low' : 'High') + ' Spin Rate',
            problem: 'Your spin is ' + data.spinRate + ' rpm. For ' + skillLevel + ' with ' + club + ', optimal is ' + targets.spinRate.min + '-' + targets.spinRate.max + ' rpm. ' + (tooLowSpin ? 'Too little spin can cause the ball to drop out of the sky and reduce control, especially into greens.' : "Too much spin costs you significant distance - you're creating too much backspin which fights forward momentum."),
            fix: tooLowSpin
                ? (club === 'driver' ? 'Driver fixes: (1) Check if you\'re delofting excessively - may need more loft on your driver, (2) Hit slightly more up on it (positive attack angle), (3) Your shaft may be too stiff, (4) Clean your clubface and check for worn grooves.' : 'Iron fixes: (1) Ensure clean, crisp contact - not thin strikes, (2) Check your grooves aren\'t worn, (3) You may be catching it thin or low on the face, (4) Maintain dynamic loft through impact.')
                : (club === 'driver' ? 'Driver fixes: (1) Tee it higher and swing more up on it, (2) You\'re likely hitting down (negative attack angle) - fix this first, (3) May be hitting high on the face, (4) Could need less loft on your driver head.' : 'Iron fixes: (1) Reduce angle of attack - you\'re coming in too steep, (2) Less forward shaft lean at impact, (3) Shallow out your downswing, (4) Feel like you\'re "releasing" the club earlier through impact.')
        });
    }
    if (data.aoa !== null && club === 'driver') {
        if (data.aoa < targets.aoa.min) {
            issues.push({
                priority: 2,
                title: 'Negative Attack Angle with Driver',
                problem: "You're hitting down on your driver (" + data.aoa.toFixed(1) + "°). For " + skillLevel + ", you should be between " + targets.aoa.min.toFixed(1) + "° and " + targets.aoa.optimal.toFixed(1) + "°. This costs you distance and creates excessive spin.",
                fix: 'Driver attack angle fixes: (1) Tee it HIGH - half the ball above the crown, (2) Ball position forward - off lead heel or toe, (3) Widen stance and tilt spine away from target, (4) Feel like your head stays behind the ball through impact, (5) Practice the "up at it" drill - literally feel like you\'re swinging up at the ball.'
            });
        }
    }
    issues.sort(function (a, b) { return a.priority - b.priority; });
    return issues;
}

function getTargetDataHTML(targets, club, skillLevel, profile) {
    var clubSelect = document.getElementById('club');
    var clubName = clubSelect.options[clubSelect.selectedIndex].text;
    var typicalAverages = getTypicalAverages(club, profile);
    var html = '<div class="target-data"><h3>📊 Your Numbers vs Benchmarks (' + skillLevel + ')</h3>';
    if (typicalAverages && Object.keys(typicalAverages).length > 0) {
        html += '<div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin-bottom: 15px; border-left: 4px solid #ffc107;"><h4 style="color: #856404; margin-bottom: 10px; font-size: 14px;">📈 Typical Averages for ' + skillLevel + '</h4><p style="color: #856404; font-size: 13px; margin-bottom: 8px;">This is what golfers at your level typically achieve:</p><div class="target-grid">';
        if (typicalAverages.launchAngle) {
            html += '<div class="target-item" style="background: #fff;"><div class="label">Launch Angle</div><div class="value" style="color: #856404;">' + typicalAverages.launchAngle.toFixed(1) + '°</div></div>';
        }
        if (typicalAverages.spinRate) {
            html += '<div class="target-item" style="background: #fff;"><div class="label">Spin Rate</div><div class="value" style="color: #856404;">' + Math.round(typicalAverages.spinRate) + '</div></div>';
        }
        if (typicalAverages.aoa !== undefined) {
            html += '<div class="target-item" style="background: #fff;"><div class="label">Attack Angle</div><div class="value" style="color: #856404;">' + (typicalAverages.aoa > 0 ? '+' : '') + typicalAverages.aoa.toFixed(1) + '°</div></div>';
        }
        html += '</div></div>';
    }
    html += '<div style="background: #e8f5e9; padding: 15px; border-radius: 8px; border-left: 4px solid #2e7d32;"><h4 style="color: #2e7d32; margin-bottom: 10px; font-size: 14px;">🎯 Optimal Targets for ' + skillLevel + '</h4><p style="color: #2e7d32; font-size: 13px; margin-bottom: 8px;">Aim for these numbers to maximize performance:</p><div class="target-grid">';
    html += '<div class="target-item" style="background: #fff;"><div class="label">Smash Factor</div><div class="value">' + targets.smash.optimal.toFixed(2) + '</div></div>';
    html += '<div class="target-item" style="background: #fff;"><div class="label">Launch Angle</div><div class="value">' + targets.launchAngle.optimal.toFixed(1) + '°</div></div>';
    html += '<div class="target-item" style="background: #fff;"><div class="label">Spin Rate</div><div class="value">' + Math.round(targets.spinRate.optimal) + '</div></div>';
    html += '<div class="target-item" style="background: #fff;"><div class="label">Attack Angle</div><div class="value">' + (targets.aoa.optimal > 0 ? '+' : '') + targets.aoa.optimal.toFixed(1) + '°</div></div>';
    html += '</div></div></div>';
    return html;
}

function displayResults(issues, targets, club, data, profile) {
    var resultsDiv = document.getElementById('results');
    var skillLevel = getSkillLevel(profile);
    if (issues.length === 0) {
        resultsDiv.innerHTML = '<h2>✅ Excellent Numbers!</h2><div class="warning"><p>Your TrackMan data looks very solid for ' + skillLevel + '. Keep up the great work! Focus on consistency, course management, and maintaining these numbers under pressure.</p></div>' + getTargetDataHTML(targets, club, skillLevel, profile);
    } else {
        var html = '<h2>🎯 Your Focus Areas</h2>';
        html += '<p style="color: #666; margin-bottom: 20px;">Based on your profile as ' + skillLevel + ", here's what to work on:</p>";
        issues.forEach(function (issue, index) {
            html += '<div class="priority-box"><h3>' + (index === 0 ? '🔴 Priority #1: ' : '🟡 Priority #2: ') + issue.title + '</h3>';
            html += '<p><strong>The Issue:</strong> ' + issue.problem + '</p>';
            html += '<p><strong>The Fix:</strong> ' + issue.fix + '</p></div>';
        });
        html += getTargetDataHTML(targets, club, skillLevel, profile);
        resultsDiv.innerHTML = html;
    }
    resultsDiv.classList.add('show');
    smoothScrollTo(resultsDiv);
}
