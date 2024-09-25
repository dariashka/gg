import RebillyAPI from 'rebilly-js-sdk';

const api = RebillyAPI({
    apiKey: import.meta.env.VITE_API_KEY,
    organizationId: 'phronesis-friendfinder',
    sandbox: true,
});

const state = {
    type: 'monthly',
    amount: 0,
    customer: null,
    initialInvoiceId: null,
};

const options = {
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
};

const donationButtons = document.querySelectorAll('.donation-button');
const makeDonationButton = document.getElementById('make-donation');
const donationInput = document.querySelector('.donation-input');
const donationWrapper = document.querySelector('.donation-wrapper');

donationButtons.forEach(button => {
    button.addEventListener('click', ({target}) => {
        donationButtons.forEach(b => b.classList.remove('is-active'));
        target.classList.add('is-active');                
        if (target.dataset.type) {
            state.type = target.dataset.type;
        }
    });
});

donationInput.addEventListener('input', ({target}) => {
    state.amount = target.value;
});

makeDonationButton.addEventListener('click', () => {
    if (donationInput.checkValidity() === false) {
        donationInput.reportValidity()
        return;
    }

    if (state.type === 'one-time') {
        options.money = {
            amount: Number(state.amount),
            currency: 'USD',
        };
        donationWrapper.style.display = 'none';
        mountRebillyInstruments();

    } else {
        makeMonthlyDonation();
    }
});

async function makeMonthlyDonation() {
    document.querySelectorAll('buttons').forEach(button => button.disabled = true);
    // Create customer
    await createCustomer();
    // Create order
    await createOrder();
    // Retrieve invoice payment link
    await invoicePayment();
    document.querySelectorAll('buttons').forEach(button => button.disabled = false);
    donationInput.value = '';
}

async function createCustomer() {
    const customer = await api.customers.create({
        websiteId: 'www.ff.com',
    });
    state.customer = customer.fields;
}

async function createOrder() {
    const sub = await api.subscriptions.create({
        data: {
            customerId: state.customer.id,
            websiteId: 'www.ff.com',
            billingAddress: {},
            items: [
                { 
                    plan: {
                        name: 'Donation',
                        id: 'donation',
                        currency: 'USD',
                        pricing: {
                            price: state.amount,
                            formula: 'fixed-fee',
                        },
                        productId: 'donation',
                        recurringInterval: {
                            unit: 'month',
                            length: 1,
                        }
                    },
                    quantity: 1,
                },
            ],
        }
    });
    state.initialInvoiceId = sub.fields.initialInvoiceId;
}

async function invoicePayment() {
    const invoice = await api.invoices.get({id: state.initialInvoiceId});
    const paymentFormUrl = invoice.fields.paymentFormUrl;
    window.open(paymentFormUrl, '_blank');
}

function mountRebillyInstruments() {
    // Mount Rebilly Instruments
    RebillyInstruments.mount(options);
    // Optional
    RebillyInstruments.on('instrument-ready', (instrument) => {
        console.info(instrument);
    });
    RebillyInstruments.on('purchase-completed', (purchase) => {
        console.info('purchase-completed', purchase);
    });
}