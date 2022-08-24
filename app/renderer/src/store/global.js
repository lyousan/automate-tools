const state = {
    // client/file
    mode: '',
    isClicking: false,
    isSwiping: false
};

const getters = {
    mode: (state) => {
        return state.mode;
    },
    isClicking: (state) => {
        return state.isClicking;
    },
    isSwiping: (state) => {
        return state.isSwiping;
    }
};

const mutations = {
    setMode: (state, mode) => {
        state.mode = mode;
    },
    setSwiping: (state, isSwiping) => {
        state.isSwiping = isSwiping;
    },
    setClicking: (state, isClicking) => {
        state.isClicking = isClicking;
    }
};

const actions = {};

export default {
    namespace: true,
    state,
    getters,
    mutations,
    actions
}
