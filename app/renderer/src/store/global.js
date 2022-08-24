const state = {
    // client/file
    mode: '',
    isClicking: false,
    isSwiping: false,
    startPoint: {},
    endPoint: {}
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
    },
    startPoint: (state) => {
        return state.startPoint;
    },
    endPoint: (state) => {
        return state.endPoint;
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
    },
    setStartPoint: (state, point) => {
        state.startPoint = point;
    },
    setEndPoint: (state, point) => {
        state.endPoint = point;
    },
};

const actions = {};

export default {
    namespace: true,
    state,
    getters,
    mutations,
    actions
}
