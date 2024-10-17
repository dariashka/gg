import RebillyAPI from "rebilly-js-sdk";

const state = {
    customerId: 'cus_01J7CH07DZGYKT0PZTQ3RE8C9H',
    organizationId: 'phronesis-friendfinder',
    websiteId: 'www.ff.com',
    strategyId: 'dep_str_01JADC265PGMP7N8NYS4K80EK1',
    loaderEl: document.querySelector('.loader'),
}

const api = RebillyAPI({
    apiKey: import.meta.env.VITE_API_KEY,
    organizationId: 'phronesis-friendfinder',
    sandbox: true,
});

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

    const requestDepositData = {
        websiteId: state.websiteId,
        customerId: state.customerId,
        strategyId: state.strategyId,
        currency: 'USD',
    };

    const {fields: depositFields} = await api.depositRequests.create({
        data: requestDepositData,
    });
    response.token = exchangeToken.token;
    response.depositRequestId = depositFields.id;

    state.token = response.token;
    state.depositRequestId = response.depositRequestId;
}

async function initInstruments() {
    let options = {
        apiMode: 'sandbox',
        theme: {
            colorPrimary: '#F9740A', // Brand color
            colorText: '#333333', // Text color
            colorDanger: '#F9740A',
            buttonColorText: '#ffffff',
            fontFamily: 'Trebuchet MS, sans-serif' // Website font family
        },
        deposit: {
            depositRequestId: state.depositRequestId,
        },
        jwt: state.token,
    };

    RebillyInstruments.mount(options);
}

async function init() {
    await initRequest();
    await initInstruments();
    state.loaderEl.style.display = 'none';
}

init();



