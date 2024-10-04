import { getLocalStore } from './local-store.js';
import RebillyAPI from 'rebilly-js-sdk';

const api = RebillyAPI({
    apiKey: import.meta.env.VITE_API_KEY,
    organizationId: 'phronesis-friendfinder',
    sandbox: true,
});

const store = getLocalStore();

const state = {
    quantity: {},
    containerEl: document.querySelector('.container'),
    productEl: document.querySelector('.product'),
    hasTwoProducts: false,
    quantityPicker: null,
    buyBtn: null,
    productsId: [],
    plansId: [],
    products: [],
    plans: [],
};

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
    css: `
        .rebilly-instruments-summary-line-item-figure img {
            width: 100px;
            height: 100px;
        }
    `,
}

async function init() {
    const { selectedProduct, selectedPlanId } = store;
    state.productsId = selectedProduct.split(', ').filter(Boolean);
    state.plansId = selectedPlanId.split(', ').filter(Boolean);

    state.hasTwoProducts = state.productsId.length > 1;
    state.plansId.forEach(planId => { state.quantity[planId] = '1'; });

    try {
        state.containerEl.innerHTML = '<div class="loader"></div>';
        await fetchProductAndPlansDetails();
    } catch (error) {
        console.error(error);
        throw new Error('Failed to fetch product and plans details');
    }

    displayProduct();
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
    state.containerEl.classList.add('hide');
    state.productEl.classList.remove('hide');

    framepayOptions.items = state.plansId.map(planId => ({
        thumbnail: `https://i.ibb.co/tpf6C4C/villa-1.png`,
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

    RebillyInstruments.mount(framepayOptions);
}

function displayProduct() {
    const [stateProduct1, stateProduct2] = state.products;
    const [statePlan1, statePlan2] = state.plans

    state.containerEl.innerHTML = `
        <section class="product-feature">
            <div class="product-image">
                <div class="carousel">
                    <div class="carousel-inner">
                        <input class="carousel-open" type="radio" id="carousel-1" name="carousel" aria-hidden="true" hidden="" checked="checked">
                        <div class="carousel-item">
                            <img src="https://i.ibb.co/tpf6C4C/villa-1.png" alt="Villa Rental Starter Kit">
                        </div>
                        <input class="carousel-open" type="radio" id="carousel-2" name="carousel" aria-hidden="true" hidden="">
                        <div class="carousel-item">
                            <img src="https://i.ibb.co/F426ct5/villa-2.png" alt="Villa Rental Starter Kit 2">
                        </div>
                        <input class="carousel-open" type="radio" id="carousel-3" name="carousel" aria-hidden="true" hidden="">
                        <div class="carousel-item">
                            <img src="https://i.ibb.co/Gcfg6TF/villa-3.png" alt="Villa Rental Starter Kit 3">
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
                ${state.hasTwoProducts ? `
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