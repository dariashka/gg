import { getLocalStore, setLocalStore, clearLocalStore } from './local-store.js';

const store = getLocalStore();

const state = {
    quantity: {},
    hasTwoProducts: false,
    quantityPicker: null,
    buyBtn: null,
    products: [],
    plans: [],
};
const container = document.querySelector('.container');

async function init() {
    const { selectedProduct, selectedPlanId } = store;
    const products = selectedProduct.split(', ').filter(Boolean);
    state.hasTwoProducts = products.length > 1;
    products.forEach(product => {
        state.quantity[product] = '1';
    });

    try {
        container.innerHTML = '<div class="loader"></div>';
        await fetchProductAndPlansDetails(products);
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch product and plans details');
    }

    displayProduct({product1: products[0], product2: state.hasTwoProducts ? products[1] : null});
    bindEvents();
}

init();

async function fetchProductAndPlansDetails(products) {
    // fetch product and plans details
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve({
                products: ['product1', 'product2'],
                plans: ['plan1', 'plan2'],
            });
        }, 500);
    });
}

function bindEvents() {
    state.quantityPicker = document.querySelectorAll('.quantity-picker input');
    state.buyBtn = document.querySelector('.buy-now-btn');

    state.quantityPicker.forEach(input => {
        input.addEventListener('change', (e) => {
            const product = e.target.getAttribute('data-product');
            state.quantity[product] = e.target.value;
            console.log(state.quantity);
        });
    });
    state.buyBtn.addEventListener('click', () => {
        console.log('buy now');
        // display framepay or send to payment page
    });
}

function displayProduct({product1, product2} = {product1: '', product2: null}) {
    container.innerHTML = `
        <section class="product-feature">
            <div class="product-image">
                <div class="carousel">
                    <div class="carousel-inner">
                        <input class="carousel-open" type="radio" id="carousel-1" name="carousel" aria-hidden="true" hidden="" checked="checked">
                        <div class="carousel-item">
                            <img src="villa_1.png" alt="Villa Rental Starter Kit">
                        </div>
                        <input class="carousel-open" type="radio" id="carousel-2" name="carousel" aria-hidden="true" hidden="">
                        <div class="carousel-item">
                            <img src="villa_2.png" alt="Villa Rental Starter Kit 2">
                        </div>
                        <input class="carousel-open" type="radio" id="carousel-3" name="carousel" aria-hidden="true" hidden="">
                        <div class="carousel-item">
                            <img src="villa_3.png" alt="Villa Rental Starter Kit 3">
                        </div>
                        <label for="carousel-3" class="carousel-control prev control-1">‹</label>
                        <label for="carousel-2" class="carousel-control next control-1">›</label>
                        <label for="carousel-1" class="carousel-control prev control-2">‹</label>
                        <label for="carousel-3" class="carousel-control next control-2">›</label>
                        <label for="carousel-2" class="carousel-control prev control-3">‹</label>
                        <label for="carousel-1" class="carousel-control next control-3">›</label>
                        <ol class="carousel-indicators">
                            <li>
                                <label for="carousel-1" class="carousel-bullet">•</label>
                            </li>
                            <li>
                                <label for="carousel-2" class="carousel-bullet">•</label>
                            </li>
                            <li>
                                <label for="carousel-3" class="carousel-bullet">•</label>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
            <div class="product-details">
                <h2>${product1}</h2>
                <p>Kickstart your villa rental business with our comprehensive starter kit. Includes essential guides, marketing materials, and exclusive software access.</p>
                <p class="price">$499.99</p>
                <div class="quantity-picker">
                    <label for="quantity">Quantity:</label>
                    <input type="number" id="quantity" name="quantity" min="1" value="1" data-product="${product1}">
                </div>
                ${product2 ? `
                    <div class="product-divider"></div>
                    <h2>${product2}</h2>
                    <p>Kickstart your villa rental business with our comprehensive starter kit. Includes essential guides, marketing materials, and exclusive software access.</p>
                    <p class="price">$499.99</p>
                    <div class="quantity-picker">
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" name="quantity" min="1" value="1" data-product="${product2}">
                    </div>
                ` : ''}
                <button class="buy-now-btn">Buy Now</button>
            </div>
        </section>
    `;
}