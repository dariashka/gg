import { getLocalStore, setLocalStore, clearLocalStore } from './local-store.js';
import RebillyAPI from 'rebilly-js-sdk';

const api = RebillyAPI({
    apiKey: import.meta.env.VITE_API_KEY,
    organizationId: 'phronesis-friendfinder',
    sandbox: true,
});

const store = getLocalStore();

const state = {
    quantity: {},
    hasTwoProducts: false,
    quantityPicker: null,
    buyBtn: null,
    productsId: [],
    plansId: [],
    products: [],
    plans: [],
};

const container = document.querySelector('.container');
const product = document.querySelector('.product');

const framepayOptions = {
    publishableKey: 'pk_sandbox_MGxmn6NR0X-AggKVIog13TJZDzpiEuMbh8HeLih',
    organizationId: 'phronesis-friendfinder',
    websiteId: 'www.ff.com',
    apiMode: 'sandbox',
    theme: {
        colorPrimary: '#F9740A', // Brand color
        colorText: '#333333', // Text color
        colorDanger: '#F9740A',
        buttonColorText: '#ffffff',
        fontFamily: 'Trebuchet MS, sans-serif' // Website font family
    },  
}


async function init() {
    const { selectedProduct, selectedPlanId } = store;
    const products = selectedProduct.split(', ').filter(Boolean);
    const plans = selectedPlanId.split(', ').filter(Boolean);
    state.productsId = products;
    state.plansId = plans;

    state.hasTwoProducts = state.productsId.length > 1;
    state.plansId.forEach(planId => {
        state.quantity[planId] = '1';
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

async function fetchProductAndPlansDetails() {
    // fetch product and plans details
    for await (const product of state.productsId) {
        const {fields} = await api.products.get({id: product});
        state.products.push(fields);
    }
    for await (const plan of state.plansId) {
        const {fields} = await api.plans.get({id: plan});
        state.plans.push(fields);
    }
}

function displayPrice(price) {
    const newIntl = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    });
    return newIntl.format(price);
}

function bindEvents() {
    state.quantityPicker = document.querySelectorAll('.quantity-picker input');
    state.buyBtn = document.querySelector('.buy-now-btn');

    state.quantityPicker.forEach(input => {
        input.addEventListener('change', (e) => {
            const plan = e.target.getAttribute('data-plan');
            state.quantity[plan] = e.target.value;
        });
    });
    state.buyBtn.addEventListener('click', () => {
        buy();
    });
}

function buy() {
    container.classList.add('hide');
    product.classList.remove('hide');

    framepayOptions.items = state.plansId.map(planId => ({
        planId,
        quantity: Number(state.quantity[planId]),
    }));

    if (state.productsId.includes('ebook')) {
        framepayOptions.bumpOffer = [
            {
                planId: 'basic',
                quantity: 1,
            }
        ]
    }
    console.log(framepayOptions)
    // Mount Rebilly Instruments
    RebillyInstruments.mount(framepayOptions);
}

function displayProduct({product1, product2} = {product1: '', product2: null}) {
    const stateProduct1 = state.products[0];
    const stateProduct2 = state.hasTwoProducts ? state.products[1] : null;
    const statePlan1 = state.plans[0];
    const statePlan2 = state.hasTwoProducts ? state.plans[1] : null;

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
                <h2>${stateProduct1.name}</h2>
                <p>${stateProduct1.description}</p>
                <p class="price">${displayPrice(statePlan1.pricing.price)}</p>
                <div class="quantity-picker">
                    <label for="quantity">Quantity:</label>
                    <input type="number" id="quantity" name="quantity" min="1" value="1" data-plan="${statePlan1.id}">
                </div>
                ${product2 ? `
                    <div class="product-divider"></div>
                    <h2>${stateProduct2.name}</h2>
                    <p>${stateProduct2.description}</p>
                    <p class="price">${displayPrice(statePlan2.pricing.price)}</p>
                    <div class="quantity-picker">
                        <label for="quantity">Quantity:</label>
                        <input type="number" id="quantity" name="quantity" min="1" value="1" data-plan="${statePlan2.id}">
                    </div>
                ` : ''}
                <button class="buy-now-btn">Buy Now</button>
            </div>
        </section>
    `;
}