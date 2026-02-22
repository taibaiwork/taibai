const uiManager = (function() {
    const UI_LIST = {};
    let currentForm = null;

    function genMenu(items, title, closeBtn = 1) {
        closeAllUis();
        const ui = new UI();
        ui.setTitle(title);
        ui.setCloseButton(closeBtn);

        items.forEach((it, index) => {
            if (it.type === "TextView") {
                ui.addTextView(it.name, index);
            }
            if (it.type === "RadioGroup") {
                const opts = it.items.map(i => ({ name: i.name, value: i.key }));
                ui.addRadioGroup(it.name, opts, index, it.value || 0);
            }
            if (it.type === "SeekBar") {
                ui.addSeekBar(it.name, it.min, it.max, it.value || 1000, index);
            }
        });

        ui.show();
        UI_LIST[ui.uid] = { items, ui };

        ui.onItemClick = function(uid, idx) {
            const item = items[idx];
            try { item.onChange(); } catch (e) {}
        };

        ui.onRadioGroupChange = function(uid, idx, val) {
            const item = items[idx];
            try { item.onChange({ value: val }); } catch (e) {}
        };

        ui.onSeekBarChange = function(uid, idx, val) {
            const item = items[idx];
            try {
                if (item.key) globalThis[item.key] = val;
                item.onChange({ value: val });
            } catch (e) {}
        };
    }

    function uiForm(title, inputs, callback) {
        closeAllUis();
        const ui = new UI();
        ui.setTitle(title);

        inputs.forEach(ipt => {
            if (ipt.type === "EditText") {
                ui.addEditText(ipt.name, ipt.text || "", ipt.hint || "");
            }
            if (ipt.type === "RadioGroup") {
                const opts = ipt.items.map(it => ({ name: it.name, value: it.key }));
                ui.addRadioGroup(ipt.name, opts, 0, 0);
            }
        });

        currentForm = callback;
        ui.show();

        ui.onFinish = function(values) {
            try { currentForm(values); } catch (e) {}
            currentForm = null;
        };
    }

    function closeAllUis() {
        for (let uid in UI_LIST) {
            try { UI_LIST[uid].ui.close(); } catch (e) {}
        }
        UI_LIST = {};
        currentForm = null;
    }

    function handleModuleEvent() {}

    return {
        genMenu,
        uiForm,
        closeAllUis,
        handleModuleEvent
    };
})();

globalThis.uiManager = uiManager;
