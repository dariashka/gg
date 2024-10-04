const productState = {
    selectedProduct: null,
    selectedPlanId: null,
}

export function getLocalStore() {
    const state = localStorage.getItem('state');
    
    if (!state) {
        setLocalStore(productState);
        return productState;
    }
    return JSON.parse(state);
}

export function setLocalStore(state) {
    localStorage.setItem('state', JSON.stringify(state));
}

export function clearLocalStore() {
    localStorage.removeItem('state');
}

