/**
 * TrackMan Golf Analyzer - Firebase Auth and Firestore cloud storage
 * Depends: config.js (none). Exposes: currentUser, CLOUD_STORAGE_ENABLED, loadSessionsFromCloud, saveSessionToCloud, deleteSessionFromCloud, clearAllSessionsFromCloud, saveProfileToCloud, loadProfileFromCloud, loadUserDataFromCloud, initAuth.
 */
var currentUser = null;
var CLOUD_STORAGE_ENABLED = true;

window.currentUser = null;
window.CLOUD_STORAGE_ENABLED = CLOUD_STORAGE_ENABLED;

function waitForFirebase() {
    return new Promise(function (resolve) {
        var check = setInterval(function () {
            if (window.firebaseAuth && window.firebaseDb) {
                clearInterval(check);
                resolve();
            }
        }, 100);
    });
}

function updateUIForAuthState(user) {
    var userInfoBar = document.getElementById('userInfoBar');
    var userEmail = document.getElementById('userEmail');
    var signInPrompt = document.getElementById('signInPrompt');
    if (user) {
        userInfoBar.classList.add('show');
        userEmail.textContent = user.email;
        signInPrompt.style.display = 'none';
    } else {
        userInfoBar.classList.remove('show');
        signInPrompt.style.display = 'block';
    }
}

function openAuthModal() {
    document.getElementById('authOverlay').classList.add('show');
    document.getElementById('authError').classList.remove('show');
}

function closeAuthModal() {
    document.getElementById('authOverlay').classList.remove('show');
    document.getElementById('authError').classList.remove('show');
    document.getElementById('signinForm').reset();
    document.getElementById('signupForm').reset();
}

function switchAuthTab(tab) {
    var tabs = document.querySelectorAll('.auth-tab');
    var forms = document.querySelectorAll('.auth-form');
    tabs.forEach(function (t) { t.classList.remove('active'); });
    forms.forEach(function (f) { f.classList.remove('active'); });
    if (tab === 'signin') {
        tabs[0].classList.add('active');
        document.getElementById('signinForm').classList.add('active');
    } else {
        tabs[1].classList.add('active');
        document.getElementById('signupForm').classList.add('active');
    }
    document.getElementById('authError').classList.remove('show');
}

function showAuthError(message) {
    var el = document.getElementById('authError');
    el.textContent = message;
    el.classList.add('show');
}

function handleSignIn(event) {
    event.preventDefault();
    var email = document.getElementById('signinEmail').value;
    var password = document.getElementById('signinPassword').value;
    var btn = document.getElementById('signinBtn');
    btn.disabled = true;
    btn.innerHTML = 'Signing in... <span class="loading"></span>';
    window.firebaseAuthFunctions.signInWithEmailAndPassword(window.firebaseAuth, email, password)
        .then(function () {
            closeAuthModal();
        })
        .catch(function (error) {
            var message = 'Failed to sign in. ';
            if (error.code === 'auth/invalid-email') message += 'Invalid email address.';
            else if (error.code === 'auth/user-not-found') message += 'No account found with this email.';
            else if (error.code === 'auth/wrong-password') message += 'Incorrect password.';
            else if (error.code === 'auth/invalid-credential') message += 'Invalid email or password.';
            else message += error.message;
            showAuthError(message);
        })
        .finally(function () {
            btn.disabled = false;
            btn.textContent = 'Sign In';
        });
}

function handleSignUp(event) {
    event.preventDefault();
    var email = document.getElementById('signupEmail').value;
    var password = document.getElementById('signupPassword').value;
    var confirmPassword = document.getElementById('signupPasswordConfirm').value;
    var btn = document.getElementById('signupBtn');
    if (password !== confirmPassword) {
        showAuthError('Passwords do not match!');
        return;
    }
    btn.disabled = true;
    btn.innerHTML = 'Creating account... <span class="loading"></span>';
    window.firebaseAuthFunctions.createUserWithEmailAndPassword(window.firebaseAuth, email, password)
        .then(function () {
            alert('✅ Account created successfully! Welcome to TrackMan Analyzer!');
            closeAuthModal();
        })
        .catch(function (error) {
            var message = 'Failed to create account. ';
            if (error.code === 'auth/email-already-in-use') message += 'This email is already registered. Try signing in instead.';
            else if (error.code === 'auth/weak-password') message += 'Password is too weak. Use at least 6 characters.';
            else message += error.message;
            showAuthError(message);
        })
        .finally(function () {
            btn.disabled = false;
            btn.textContent = 'Create Account';
        });
}

function handleLogout() {
    if (!confirm('Are you sure you want to sign out?')) return;
    window.firebaseAuthFunctions.signOut(window.firebaseAuth)
        .then(function () {
            alert('✅ You have been signed out successfully.');
        })
        .catch(function (error) {
            alert('❌ Error signing out: ' + error.message);
        });
}

function saveProfileToCloud(profile) {
    if (!currentUser) return Promise.resolve();
    var userDocRef = window.firestoreFunctions.doc(window.firebaseDb, 'users', currentUser.uid);
    return window.firestoreFunctions.setDoc(userDocRef, {
        profile: profile,
        updatedAt: new Date().toISOString()
    }, { merge: true });
}

function loadProfileFromCloud() {
    if (!currentUser) return Promise.resolve(null);
    var userDocRef = window.firestoreFunctions.doc(window.firebaseDb, 'users', currentUser.uid);
    return window.firestoreFunctions.getDoc(userDocRef).then(function (docSnap) {
        if (docSnap.exists() && docSnap.data().profile) return docSnap.data().profile;
        return null;
    });
}

function saveSessionToCloud(session) {
    if (!currentUser) {
        alert('Please sign in to save sessions to the cloud.');
        return Promise.resolve(false);
    }
    var sessionsRef = window.firestoreFunctions.collection(window.firebaseDb, 'users', currentUser.uid, 'sessions');
    return window.firestoreFunctions.addDoc(sessionsRef, session).then(function () {
        return true;
    }).catch(function (error) {
        alert('❌ Error saving to cloud: ' + error.message);
        return false;
    });
}

function loadSessionsFromCloud() {
    if (!currentUser) return Promise.resolve([]);
    var sessionsRef = window.firestoreFunctions.collection(window.firebaseDb, 'users', currentUser.uid, 'sessions');
    var q = window.firestoreFunctions.query(sessionsRef, window.firestoreFunctions.orderBy('timestamp', 'desc'));
    return window.firestoreFunctions.getDocs(q).then(function (querySnapshot) {
        var sessions = [];
        querySnapshot.forEach(function (doc) {
            sessions.push({ firestoreId: doc.id, ...doc.data() });
        });
        return sessions;
    }).catch(function () {
        return [];
    });
}

function deleteSessionFromCloud(firestoreId) {
    if (!currentUser || !firestoreId) return Promise.resolve(false);
    var sessionDocRef = window.firestoreFunctions.doc(window.firebaseDb, 'users', currentUser.uid, 'sessions', firestoreId);
    return window.firestoreFunctions.deleteDoc(sessionDocRef).then(function () {
        return true;
    });
}

function clearAllSessionsFromCloud() {
    if (!currentUser) return Promise.resolve(false);
    return loadSessionsFromCloud().then(function (sessions) {
        return Promise.all(sessions.map(function (s) {
            return s.firestoreId ? deleteSessionFromCloud(s.firestoreId) : Promise.resolve();
        })).then(function () { return true; });
    });
}

function loadUserDataFromCloud() {
    if (!currentUser) return Promise.resolve();
    return loadProfileFromCloud().then(function (cloudProfile) {
        if (cloudProfile) {
            if (cloudProfile.name) document.getElementById('name').value = cloudProfile.name;
            if (cloudProfile.age) document.getElementById('age').value = cloudProfile.age;
            if (cloudProfile.handicap !== undefined) document.getElementById('handicap').value = cloudProfile.handicap;
            if (cloudProfile.rounds) document.getElementById('rounds').value = cloudProfile.rounds;
            if (cloudProfile.playerType) document.getElementById('playerType').value = cloudProfile.playerType;
        }
        if (document.getElementById('historySection').style.display !== 'none' && typeof displayHistory === 'function') {
            return displayHistory();
        }
    });
}

function initAuth() {
    return waitForFirebase().then(function () {
        window.firebaseAuthFunctions.onAuthStateChanged(window.firebaseAuth, function (user) {
            currentUser = user;
            window.currentUser = user;
            updateUIForAuthState(user);
            if (user) {
                loadUserDataFromCloud();
            } else {
                if (typeof loadProfile === 'function') loadProfile();
            }
        });
    });
}

window.loadSessionsFromCloud = loadSessionsFromCloud;
window.saveSessionToCloud = saveSessionToCloud;
window.deleteSessionFromCloud = deleteSessionFromCloud;
window.clearAllSessionsFromCloud = clearAllSessionsFromCloud;
window.saveProfileToCloud = saveProfileToCloud;
window.loadProfileFromCloud = loadProfileFromCloud;
window.loadUserDataFromCloud = loadUserDataFromCloud;
