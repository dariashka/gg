import './style.css';
import RebillyAPI from 'rebilly-js-sdk';

const api = RebillyAPI({
    apiKey: import.meta.env.VITE_API_KEY,
    organizationId: 'phronesis-friendfinder',
    sandbox: true,
});

const state = {
    customerId: 'cus_01J7CH07DZGYKT0PZTQ3RE8C9H',
    token: null,
    depositId: null,
};

const options = {
    apiMode: 'sandbox',
    theme: {
        colorPrimary: '#F9740A', // Brand color
        colorText: '#333333', // Text color
        colorDanger: '#F9740A',
        buttonColorText: '#ffffff',
        fontFamily: 'Trebuchet MS, sans-serif' // Website font family
    },
    i18n: {
        en: {
            result: {
                success: 'You are all set! Start packing your bags!',
            }
        }
    }
};

const buttons = document.querySelectorAll('.btn');
const features = document.querySelector('section.features');
const deposit = document.querySelector('section.deposit');

deposit.style.display = 'none';

buttons.forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        
        await getToken();
        await createDeposit();
        mountRebillyInstruments();
    });
});

function toggleButtons() {
    buttons.forEach(button => {
        button.disabled = !button.disabled ;
    });
}

async function getToken() {
    toggleButtons();
    const { fields: login } = await api.customerAuthentication.login({
        data: {
            mode: "passwordless",
            customerId: state.customerId,
        },
    });

    const { fields: exchangeToken } =
    await api.customerAuthentication.exchangeToken({
        token: login.token,
        data: {
            acl: [
                {
                    scope: {
                        organizationId: ['phronesis-friendfinder'],
                    },
                    permissions: [
                        "PostToken",
                        "PostDigitalWalletValidation",
                        "StorefrontGetAccount",
                        "StorefrontPatchAccount",
                        "StorefrontPostPayment",
                        "StorefrontGetTransactionCollection",
                        "StorefrontGetTransaction",
                        "StorefrontGetPaymentInstrumentCollection",
                        "StorefrontPostPaymentInstrument",
                        "StorefrontGetPaymentInstrument",
                        "StorefrontPatchPaymentInstrument",
                        "StorefrontPostPaymentInstrumentDeactivation",
                        "StorefrontGetWebsite",
                        "StorefrontGetInvoiceCollection",
                        "StorefrontGetInvoice",
                        "StorefrontGetProductCollection",
                        "StorefrontGetProduct",
                        "StorefrontPostReadyToPay",
                        "StorefrontGetPaymentInstrumentSetup",
                        "StorefrontPostPaymentInstrumentSetup",
                        "StorefrontGetDepositRequest",
                        "StorefrontGetDepositStrategy",
                        "StorefrontPostDeposit",
                    ],
                },
            ],
            customClaims: {
                websiteId: 'www.ff.com',
            },
        },
    });
    state.token = exchangeToken.token;
    toggleButtons();
}

async function createDeposit() {
    const { fields: depositFields } = await api.depositRequests.create({
        data: {
            "websiteId": "www.ff.com",
            "customerId": "cus_01J7CH07DZGYKT0PZTQ3RE8C9H",
            "currency": "USD",
            "strategyId": "dep_str_01J7GTSN97A6HCQJTVKJ4XCN51",
        }
    });

    state.depositId = depositFields.id;
}

function mountRebillyInstruments() {
    features.style.display = 'none';
    options.deposit = { depositRequestId: state.depositId };
    options.jwt = state.token;

    deposit.style.display = 'block';

    // Mount Rebilly Instruments
    RebillyInstruments.mount(options);
    // Optional
    RebillyInstruments.on('instrument-ready', (instrument) => {
        console.info(instrument);
    });
    RebillyInstruments.on('purchase-completed', (purchase) => {
        console.info('purchase-completed', purchase);

        const head = document.createElement('h2');
        head.textContent = 'Our team will contact you shortly to confirm your booking.';
        head.style.textAlign = 'center';
        document.querySelector('footer').insertAdjacentHTML('beforebegin', head.outerHTML);
    });
}