import RebillyAPI from "rebilly-js-sdk";

const state = {
    customerId: 'test-customer',
    organizationId: 'gamble-garden',
    websiteId: 'www.gamblegarden.com',
    strategies: {
        USD: 'dep_str_01JBH5KH5F0C33FZE8RJ0X1EN0',
        CAD: 'dep_str_01JBH5MVQXDBPKC7ZQGJV4EA4Y'
    },
    loaderEl: document.querySelector('.loader'),
    currency: 'USD',
    customerType: 'default', // default or vip
    customerIds: {
        default: 'test-customer',
        vip: 'cus_01JF04BWS6YBE5V1P52XQSSZEA',
    },
};

const api = RebillyAPI({
    apiKey: import.meta.env.VITE_API_KEY,
    organizationId: state.organizationId,
    sandbox: true,
});

function selectCustomer(button, customerType) {
    // Remove active class from all buttons
    document.querySelectorAll('.customer-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to the clicked button
    button.classList.add('active');

    console.log('Selected customer type:', customerType);
    state.customerType = customerType;

    // Update customerId based on the selected type
    state.customerId = state.customerIds[customerType];

    // Reinitialize the deposit request
    initRequest()
        .then(() => updateInstruments())
        .catch(err => console.error('Error initializing instruments:', err));
}

const customerButtons = document.querySelectorAll('.customer-btn');
customerButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const customerType = button.getAttribute('data-customer');
        selectCustomer(button, customerType);
    });
});

async function selectCurrency(button, currency) {
    // Remove active class from all buttons
    document.querySelectorAll('.currency-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Add active class to clicked button
    button.classList.add('active');

    console.log('Selected currency:', currency);
    state.currency = currency;

    state.depositRequestId = await getDepositRequestId();

    RebillyInstruments.update({
        deposit: {
            depositRequestId: state.depositRequestId,
        },
    })
}

const currencyButtons = document.querySelectorAll('.currency-btn');
currencyButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
        e.preventDefault();
        await selectCurrency(button, button.textContent);
    })
})

async function getDepositRequestId() {
    const requestDepositData = {
        websiteId: state.websiteId,
        customerId: state.customerId,
        strategyId: state.strategies[state.currency],
        currency: state.currency,
        customPropertySetId: 'dep_prop_01JBH5DXX17E6XYG0TWVAVDPEQ',
    };

    const { fields: depositFields } = await api.depositRequests.create({
        data: requestDepositData,
    });

    return depositFields.id;
}

async function initRequest() {
    const response = {};
    const data = {
        mode: "passwordless",
        customerId: state.customerId,
    };
    const {fields: login} = await api.customerAuthentication.login({
        data,
    });
    const {fields: exchangeToken} =
        await api.customerAuthentication.exchangeToken({
            token: login.token,
            data: {
                acl: [
                    {
                        scope: {
                            organizationId: state.organizationId,
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
                    websiteId: state.websiteId,
                },
            },
        });

    console.log(state);

    response.token = exchangeToken.token;
    response.depositRequestId = await getDepositRequestId();

    state.token = response.token;
    state.depositRequestId = response.depositRequestId;
}

async function initInstruments() {
    const options = {
        apiMode: 'sandbox',
        theme: {
            colorPrimary: '#333333',
            colorText: '#333',
            colorDanger: '#F9740A',
            buttonColorText: '#ffffff',
            fontFamily: 'Trebuchet MS, sans-serif'
        },
        deposit: {
            depositRequestId: state.depositRequestId,
        },
        jwt: state.token,
    };

    RebillyInstruments.mount(options);
}

async function updateInstruments() {
    RebillyInstruments.update({
        deposit: {
            depositRequestId: state.depositRequestId,
        },
        jwt: state.token,
    });
}

async function init() {
    await initRequest();
    await initInstruments();
    state.loaderEl.style.display = 'none';
}

init();



