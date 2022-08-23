import {createStore} from 'vuex'
import layout from "./modules/layout";
import settings from "./modules/settings";
import importFile from "./modules/importFile";
import search from "./modules/search";
import global from "./global";

export default createStore({
    modules: {
        layout,
        settings,
        importFile,
        search,
        global
    },
})
