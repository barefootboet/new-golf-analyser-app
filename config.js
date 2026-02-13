/**
 * TrackMan Golf Analyzer - Configuration and data
 * Club targets and storage keys. Load first.
 */
var STORAGE_KEY = 'golfAnalyzerHistory';
var PROFILE_KEY = 'golfAnalyzerProfile';

var clubTargets = {
    driver: {
        smash: { min: 1.48, max: 1.52, optimal: 1.50 },
        aoa: { min: -1, max: 5, optimal: 3 },
        launchAngle: { min: 10, max: 14, optimal: 12 },
        spinRate: { min: 2000, max: 2700, optimal: 2400 },
        speedRatio: { min: 1.48, max: 1.52, optimal: 1.50 }
    },
    '7iron': {
        smash: { min: 1.36, max: 1.42, optimal: 1.39 },
        aoa: { min: -5, max: -2, optimal: -3.5 },
        launchAngle: { min: 15, max: 19, optimal: 17 },
        spinRate: { min: 6500, max: 7500, optimal: 7000 },
        speedRatio: { min: 1.36, max: 1.42, optimal: 1.39 }
    },
    pw: {
        smash: { min: 1.20, max: 1.28, optimal: 1.24 },
        aoa: { min: -6, max: -3, optimal: -4.5 },
        launchAngle: { min: 22, max: 26, optimal: 24 },
        spinRate: { min: 8500, max: 10000, optimal: 9200 },
        speedRatio: { min: 1.20, max: 1.28, optimal: 1.24 }
    },
    gw: {
        smash: { min: 1.18, max: 1.26, optimal: 1.22 },
        aoa: { min: -6, max: -3, optimal: -4.5 },
        launchAngle: { min: 24, max: 28, optimal: 26 },
        spinRate: { min: 9000, max: 10500, optimal: 9750 },
        speedRatio: { min: 1.18, max: 1.26, optimal: 1.22 }
    },
    sw: {
        smash: { min: 1.16, max: 1.24, optimal: 1.20 },
        aoa: { min: -6, max: -3, optimal: -4.5 },
        launchAngle: { min: 26, max: 30, optimal: 28 },
        spinRate: { min: 9500, max: 11000, optimal: 10250 },
        speedRatio: { min: 1.16, max: 1.24, optimal: 1.20 }
    },
    lw: {
        smash: { min: 1.14, max: 1.22, optimal: 1.18 },
        aoa: { min: -6, max: -3, optimal: -4.5 },
        launchAngle: { min: 28, max: 32, optimal: 30 },
        spinRate: { min: 10000, max: 11500, optimal: 10750 },
        speedRatio: { min: 1.14, max: 1.22, optimal: 1.18 }
    }
};

function interpolateTargets(t1, t2, ratio) {
    var result = {};
    for (var key in t1) {
        result[key] = {};
        for (var subKey in t1[key]) {
            result[key][subKey] = t1[key][subKey] + (t2[key][subKey] - t1[key][subKey]) * ratio;
        }
    }
    return result;
}

clubTargets['3wood'] = interpolateTargets(clubTargets.driver, clubTargets['7iron'], 0.3);
clubTargets['5wood'] = interpolateTargets(clubTargets.driver, clubTargets['7iron'], 0.4);
clubTargets['3iron'] = interpolateTargets(clubTargets.driver, clubTargets['7iron'], 0.5);
clubTargets['4iron'] = interpolateTargets(clubTargets.driver, clubTargets['7iron'], 0.6);
clubTargets['5iron'] = interpolateTargets(clubTargets.driver, clubTargets['7iron'], 0.7);
clubTargets['6iron'] = interpolateTargets(clubTargets.driver, clubTargets['7iron'], 0.85);
clubTargets['8iron'] = interpolateTargets(clubTargets['7iron'], clubTargets.pw, 0.33);
clubTargets['9iron'] = interpolateTargets(clubTargets['7iron'], clubTargets.pw, 0.66);
