const {ipcRenderer} = require("electron");
import {mapToTree} from '../../common/utils.js';

const state = {
    xmlFilePath: '',
    capFilePath: '',
    originNodeCache: new Map,
    renderedNodeCache: new Map,
    nodeTree: {},
    currentNode: {},
    clickedNodes: [],
    excludeNodes: [],
    originXml: ''
}

const getters = {
    xmlFilePath: (state) => {
        return state.xmlFilePath;
    },
    capFilePath: (state) => {
        console.log(state.capFilePath);
        return state.capFilePath;
    },
    originNodeCache: (state, getters, rootState) => {
        return state.originNodeCache;
    },
    renderedNodeCache: (state, getters, rootState) => {
        return state.renderedNodeCache;
    },
    nodeTree: (state) => {
        return state.nodeTree;
    },
    clickedNodes: (state) => {
        return state.clickedNodes;
    },
    excludeNodes: (state) => {
        return state.excludeNodes;
    },
    currentNode: (state) => {
        return state.currentNode;
    },
    originXml: (state) => {
        return state.originXml;
    }
}

const mutations = {
    setXmlFilePath: (state, {filepath}) => {
        state.xmlFilePath = filepath;
    },
    setCapFilePath: (state, {filepath}) => {
        state.capFilePath = filepath;
    },
    clearOriginNodeCache: (state) => {
        state.originNodeCache.clear();
    },
    clearCurrentNode: (state) => {
        state.currentNode = {};
    },
    clearExcludeNodes: (state) => {
        state.excludeNodes = [];
    },
    clearRenderedNodeCache: (state) => {
        state.renderedNodeCache.clear();
    },
    loadOriginNodeCache: async (state, payload) => {
        // console.log("mutations.loadOriginNodeCache:", payload);
        state.originNodeCache = payload;
    },
    renderNodeCache: (state, payload) => {
        let {scaleRate} = payload;
        console.log("mutations.renderNodeCache:", payload);
        state.originNodeCache.forEach((v, k) => {
            let bounds = v.bounds;
            bounds = bounds.replace('][', ',').replace('[', '').replace(']', '').split(',');
            let width = Math.floor((bounds[2] - bounds[0]) * scaleRate);
            let height = Math.floor((bounds[3] - bounds[1]) * scaleRate);
            let x = Math.floor(bounds[0] * scaleRate);
            let y = Math.floor(bounds[1] * scaleRate);
            v.style = {
                top: y + 'px',
                left: x + 'px',
                width: width + 'px',
                height: height + 'px'
            };
            // console.log(v, k);
            state.renderedNodeCache.set(k, v);
        })
        // console.log(state.renderedNodeCache)
    },
    loadNodeTree: (state) => {
        state.nodeTree = mapToTree(state.originNodeCache, null);
        console.log(state.nodeTree);
    },
    setCurrentNode: (state, cacheId) => {
        state.currentNode = state.originNodeCache.get(cacheId);
    },
    addClickedNode: (state, cacheId) => {
        state.clickedNodes.push(cacheId);
    },
    clearClickedNodes: (state) => {
        state.clickedNodes = [];
    },
    addExcludeNode: (state, cacheId) => {
        state.excludeNodes.push(cacheId);
    },
    removeExcludeNode: (state, cacheId) => {
        state.excludeNodes.forEach((value, index, array) => {
            if (value == cacheId) {
                array.splice(index, 1);
            }
        })
    },
    setOriginXml: (state, originXml) => {
        state.originXml = originXml;
    }
}

const actions = {
    renderNodeCache: async ({state, commit}, payload) => {
        commit('clearOriginNodeCache');
        commit('clearRenderedNodeCache');
        let originNodeCache = await ipcRenderer.invoke('loadDoc', state.xmlFilePath);
        commit('loadOriginNodeCache', originNodeCache);
        commit('renderNodeCache', payload);
    },
    loadNodeTree: async ({state, commit}) => {
        commit('clearOriginNodeCache');
        let originNodeCache = await ipcRenderer.invoke('loadDoc', state.xmlFilePath);
        let originXml = await ipcRenderer.invoke('getOriginXml');
        commit('setOriginXml', originXml);
        commit('loadOriginNodeCache', originNodeCache);
        await commit('loadNodeTree');
    },
    setCurrentNode: ({commit}, cacheId) => {
        commit('clearCurrentNode');
        commit('setCurrentNode', cacheId);
        commit('addClickedNode', cacheId);
    },
    toggleExcludeNode: ({state, commit}, cacheId) => {
        if (state.excludeNodes.indexOf(cacheId) > -1) {
            commit('removeExcludeNode', cacheId);
        } else {
            commit('addExcludeNode', cacheId);
        }
    },
    setOriginXml: async ({state, commit}) => {
        state.originXml = await ipcRenderer.invoke('getOriginXml');
    }
}

export default {
    namespace: true,
    state,
    getters,
    mutations,
    actions
}
