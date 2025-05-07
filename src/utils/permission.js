/*
useStore 是一个组合式 API 函数，只能在 setup 函数或函数式组件中使用,避免在普通的 JavaScript 模块中直接使用 useStore
可以将 store 作为参数传递给 checkPermission 函数，这样可以在任何地方调用 checkPermission 时传递 store 实例。
*/
// 权限检查函数，接收两个参数：store 和 requiredRole。store 是 Vuex 的 store 实例，requiredRole 是需要检查的权限角色。
export function checkPermission(store, requiredRole) {
    if (!store || !store.state) return false;
    const userRole = store.state.user?.role;
    if (!userRole) return false;
    if (requiredRole === 'ADMIN') {
        return userRole === 'ADMIN';
    }
    return true;
}