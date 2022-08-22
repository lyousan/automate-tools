export const mapToTree = (map, pid) => {
    const arrToTree = (arr, pid) => {
        return arr.filter(item => {
            return item.parentId === pid
        }).map(item => {
            item.children = arrToTree(arr, item.cacheId);
            return item;
        })
    }
    let arr = Array.from(map.values());
    return arrToTree(arr, pid);
}




