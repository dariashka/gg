import { getLocalStore, setLocalStore, clearLocalStore } from './local-store.js';

clearLocalStore();

const store = getLocalStore();
const storeItems = document.querySelectorAll('.store-item');

storeItems.forEach(item => {
    item.addEventListener('click', () => {
        const [product, plan] = [item.dataset.product, item.dataset.plan];

        store.selectedProduct = product;
        store.selectedPlanId = plan;
        setLocalStore(store);
        window.location.href = './product.html';
    });
});
