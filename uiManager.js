// ==============================================
//             太白专属 · 远程UI菜单库
// ==============================================
const uiManager = (function() {
    const UI_CACHE = {};
    let formCallback = null;

    // 生成菜单
    function genMenu(items, title, closeBtn = 1) {
        closeAllUis();
        const ui = new UI();
        ui.setTitle(title);
        ui.setCloseButton(closeBtn);

        items.forEach((item, index) => {
            if (item.type === "TextView") {
                ui.addTextView(item.name, index);
            }
            if (item.type === "RadioGroup") {
                const opts = item.items.map(it => ({
                    name: it.name,
                    value: it.key
                }));
                ui.addRadioGroup(item.name, opts, index, item.value || 0);
            }
            if (item.type === "SeekBar") {
                ui.addSeekBar(item.name, item.min, item.max, item.value || 1000, index);
            }
        });

        ui.show();
        UI_CACHE[ui.uid] = { items, ui };

        // 点击事件
        ui.onItemClick = function(uid, idx) {
            const it = items[idx];
            it?.onChange?.();
        };

        // 单选框改变
        ui.onRadioGroupChange = function(uid, idx, val) {
            const it = items[idx];
            it?.onChange?.({ value: val });
        };

        // 滑块改变
        ui.onSeekBarChange = function(uid, idx, val) {
            const it = items[idx];
            if (it.key) globalThis[it.key] = val;
            it?.onChange?.({ value: val });
        };
    }

    // 表单输入
    function uiForm(title, inputs, callback) {
        closeAllUis();
        const ui = new UI();
        ui.setTitle(title);

        inputs.forEach(ipt => {
            if (ipt.type === "EditText") {
                ui.addEditText(ipt.name, ipt.text || "", ipt.hint || "");
            }
            if (ipt.type === "RadioGroup") {
                const opts = ipt.items.map(it => ({
                    name: it.name,
                    value: it.key
                }));
                ui.addRadioGroup(ipt.name, opts, 0, 0);
            }
        });

        formCallback = callback;
        ui.show();

        ui.onFinish = function(values) {
            formCallback?.(values);
            formCallback = null;
        };
    }

    // 关闭所有UI
    function closeAllUis() {
        for (let key in UI_CACHE) {
            try { UI_CACHE[key].ui.close(); } catch (e) {}
        }
        for (let key in UI_CACHE) delete UI_CACHE[key];
        formCallback = null;
    }

    // 兼容事件
    function handleModuleEvent() {}

    return {
        genMenu,
        uiForm,
        closeAllUis,
        handleModuleEvent
    };
})();

// 挂载全局
globalThis.uiManager = uiManager;
