(function () {
  const STORAGE_KEY = 'vf_records_v1';
  const SYNC_CODE_KEY = 'vf_sync_code';
  const DEFAULT_SYNC_CODE = 'vertafield';

  let db = null;
  let unsubscribe = null;
  let onRecordsUpdate = null;
  let onReady = null;

  function getSyncCode() {
    return (localStorage.getItem(SYNC_CODE_KEY) || DEFAULT_SYNC_CODE).trim() || DEFAULT_SYNC_CODE;
  }

  function setSyncCode(code) {
    localStorage.setItem(SYNC_CODE_KEY, (code || DEFAULT_SYNC_CODE).trim() || DEFAULT_SYNC_CODE);
  }

  function isCloudEnabled() {
    const c = window.VERTA_FIREBASE;
    return !!(c && c.enabled && c.projectId && typeof firebase !== 'undefined');
  }

  function recordsRef() {
    return db.collection('teams').doc(getSyncCode()).collection('records');
  }

  function saveLocal(records) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  function loadLocal() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function sampleRecords() {
    return [
      { id: 's1', origin: 'Quezon City Farm', destination: 'Quiapo Market', distance: 12, travelTime: 1.5, userRole: 'Farmer', productType: 'Vegetables', productWeight: 50, freshness: 4, damageLevel: 1, tempCondition: 'Ambient (room temp)', handling: 'Careful', notes: '', date: '2025-01-10' },
      { id: 's2', origin: 'Bulacan Fields', destination: 'Divisoria', distance: 35, travelTime: 3, userRole: 'Distributor', productType: 'Fruits', productWeight: 120, freshness: 3, damageLevel: 2, tempCondition: 'Ambient (room temp)', handling: 'Normal', notes: '', date: '2025-01-11' },
      { id: 's3', origin: 'Laguna Farm', destination: 'Pasay Market', distance: 58, travelTime: 4, userRole: 'Distributor', productType: 'Vegetables', productWeight: 80, freshness: 2, damageLevel: 3, tempCondition: 'Hot / exposed to sun', handling: 'Rough', notes: 'Heavy traffic', date: '2025-01-12' },
    ];
  }

  function sortRecords(records) {
    return records.slice().sort((a, b) => {
      const dc = (b.date || '').localeCompare(a.date || '');
      return dc !== 0 ? dc : (b.id || '').localeCompare(a.id || '');
    });
  }

  function setSyncStatus(msg) {
    const el = document.getElementById('syncStatus');
    if (el) el.textContent = msg;
  }

  function pushRecords(records) {
    saveLocal(records);
    if (onRecordsUpdate) onRecordsUpdate(sortRecords(records));
  }

  async function seedCloudIfEmpty() {
    const snap = await recordsRef().limit(1).get();
    if (!snap.empty) return;
    const samples = sampleRecords();
    const batch = db.batch();
    samples.forEach((r) => batch.set(recordsRef().doc(r.id), r));
    await batch.commit();
  }

  function startListener() {
    if (unsubscribe) unsubscribe();
    unsubscribe = recordsRef().onSnapshot(
      (snap) => {
        const records = [];
        snap.forEach((doc) => records.push(doc.data()));
        pushRecords(records);
        setSyncStatus('Live sync · ' + records.length + ' records · team: ' + getSyncCode());
      },
      (err) => {
        console.error(err);
        setSyncStatus('Sync error — showing saved copy on this phone');
        pushRecords(loadLocal());
      }
    );
  }

  function stopListener() {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  }

  async function initCloud() {
    const cfg = window.VERTA_FIREBASE;
    if (!firebase.apps.length) firebase.initializeApp(cfg);
    db = firebase.firestore();
    setSyncStatus('Connecting…');
    await seedCloudIfEmpty();
    startListener();
    if (onReady) onReady();
  }

  function initLocal() {
    let records = loadLocal();
    if (!records.length) {
      records = sampleRecords();
      saveLocal(records);
    }
    pushRecords(records);
    setSyncStatus('This phone only — set up cloud sync in js/firebase-config.js');
    if (onReady) onReady();
  }

  window.VertaSync = {
    init(onUpdate, ready) {
      onRecordsUpdate = onUpdate;
      onReady = ready;
      const input = document.getElementById('syncCodeInput');
      if (input) input.value = getSyncCode();
      if (isCloudEnabled()) initCloud();
      else initLocal();
    },

    reinit(onUpdate, ready) {
      stopListener();
      db = null;
      this.init(onUpdate, ready);
    },

    applySyncCode(code) {
      setSyncCode(code);
      this.reinit(onRecordsUpdate, onReady);
    },

    getSyncCode,

    isCloudEnabled,

    async persistRecord(rec, allRecords) {
      saveLocal(allRecords);
      if (db) await recordsRef().doc(rec.id).set(rec);
    },

    async removeRecord(id, allRecords) {
      saveLocal(allRecords);
      if (db) await recordsRef().doc(id).delete();
    },

    saveLocalCache(records) {
      saveLocal(records);
    },
  };
})();
