(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.vueSwitch = {})));
}(this, (function (exports) {
    'use strict';
    var vueSwitch = {
        name: 'vue-switch',
        model: {
            prop: 'isChecked',
            event: 'toggle'
        },
        props: {
            checkedValue: {
                type: Number,
                default: 1,
            },
            unCheckedValue: {
                type: Number,
                default: 0
            },
            isChecked: function() {
                return {
                    default: 0,
                    type: Number
                }
            }
        },
        template: `
            <div>
                <label class="switch" :class="{on: isChecked }" @click="toggle">
                    <span />
                </label>
            </div>
        `,
        methods: {
            toggle: function() {
              this.$emit("toggle", this.isChecked != this.checkedValue ? this.checkedValue : this.unCheckedValue);
            }
          }
    };

    var vueSwitchPlugin = {
        install: function install(Vue, options) {
            Vue.component(vueSwitch.name, vueSwitch);
        }
    };

    if (typeof window !== 'undefined' && window.Vue) {
        window.Vue.use(vueSwitchPlugin);
    }

    exports.default = vueSwitchPlugin;
    exports.vueSwitch = vueSwitch;

    Object.defineProperty(exports, '__esModule', { value: true });

})));