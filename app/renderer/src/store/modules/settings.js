const {ipcRenderer} = require("electron");

const state = {
    settingsModalVisible: false,
    isOk: false,
    devices: [],
    currentDevice: '',
};

const getters = {
    settingsModalVisible: (state) => {
        return state.settingsModalVisible;
    },
    isOk: (state) => {
        return state.isOk;
    },
    devices: (state) => {
        return state.devices;
    },
    currentDevice: (state) => {
        return state.currentDevice;
    }
};

const mutations = {
    showSettingsModal: (state) => {
        state.settingsModalVisible = true;
    },
    hideSettingsModal: (state) => {
        state.settingsModalVisible = false;
    },
    ok: (state) => {
        state.isOk = true;
    },
    notOk: (state) => {
        state.isOk = false;
    },
    setDevices: (state, devices) => {
        state.devices = devices;
    },
    setCurrentDevice: (state, udid) => {
        state.currentDevice = udid;
    }
};

const actions = {
    loadDevices: async ({commit}) => {
        let devices = await ipcRenderer.invoke('loadDevices');
        commit('setDevices', devices);
        if (devices.length === 1) {
            commit('setCurrentDevice', devices[0]);
        } else if (devices.length === 0) {
            commit('setCurrentDevice', '');
        }
    }
};

export default {
    namespace: true,
    state,
    getters,
    mutations,
    actions
}
