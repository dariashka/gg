const handler = {
    get: () => {
        return Reflect.get(target, property);
    },
    set: (target, property, value) => {
        if (property === 'liveReplay' ||( property === 'partnerTicket' || property === 'numberOfPartners')) {
            if (property === 'partnerTicket') {
                elements.inputPartnersQty.value = !value ? null : 1;
                elements.inputPartnersQty.classList.toggle('is-not-visible');
            }
            updateSummary(property);
        }
        return Reflect.set(target, property, value);
    }
}

const state = new Proxy({
    liveReplay: null,
    partnerTicket: null,
    numberOfPartners: null,
    summary: null,
    paymentToken: null,
}, handler);

Framepay.initialize({
    publishableKey: "pk_sandbox_MGxmn6NR0X-AggKVIog13TJZDzpiEuMbh8HeLih",
    icon: {
        color: "#2c3e50",
    },
    style: {
        base: {
        fontSize: "16px",
        boxShadow: "none",
        },
    },
});

const elements = {
    form: document.querySelector('form'),
    framepay: document.querySelector('.framepay-mounting-point'),
    inputReplays: document.querySelector('#replays'),
    inputPartners: document.querySelector('#partners'),
    inputPartnersQty: document.querySelector('#qty'),
}

function updateSummary(prop) {
    console.log(prop)
}

function bindELements() {
    elements.inputReplays.addEventListener('change', (e) => {
        state.liveReplay = e.target.checked;
    });

    elements.inputPartners.addEventListener('change', (e) => {
        state.partnerTicket = e.target.checked;
    });

    elements.inputPartnersQty.addEventListener('input', (e) => {
        state.numberOfPartners = e.target.value;
    });
}

Framepay.on("ready", function () {
    Framepay.card.mount(elements.framepay);
});

elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(e);
});


function init() {
    console.log(state);
    bindELements();
}

init();
