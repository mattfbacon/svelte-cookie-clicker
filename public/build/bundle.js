
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = append_empty_stylesheet(node).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = (program.b - t);
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.43.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    var itemData = [
    	{
    		name: "Cursor",
    		cps: 0.1,
    		price: 15,
    	}, {
    		name: "Grandma",
    		cps: 1,
    		price: 100,
    	}, {
    		name: "Farm",
    		cps: 8,
    		price: 1100,
    	}, {
    		name: "Mine",
    		cps: 47,
    		price: 12000,
    	}, {
    		name: "Factory",
    		cps: 260,
    		price: 1.3e5,
    	}, {
    		name: "Bank",
    		cps: 1400,
    		price: 1.4e6,
    	}, {
    		name: "Temple",
    		cps: 7800,
    		price: 20e6,
    	}, {
    		name: "Wizard Tower",
    		cps: 44e3,
    		price: 330e6,
    	}, {
    		name: "Shipment",
    		cps: 260e3,
    		price: 5.1e9,
    	}, {
    		name: "Alchemy Lab",
    		cps: 1.6e6,
    		price: 75e9,
    	}, {
    		name: "Portal",
    		cps: 10e6,
    		price: 1e12,
    	}, {
    		name: "Time Machine",
    		cps: 65e6,
    		price: 14e12,
    	}, {
    		name: "Antimatter Condenser",
    		cps: 430e6,
    		price: 170e12,
    	}, {
    		name: "Prism",
    		cps: 2.9e9,
    		price: 2.1e15,
    	}, {
    		name: "Chancemaker",
    		cps: 21e9,
    		price: 26e15,
    	}, {
    		name: "Fractal Engine",
    		cps: 150e9,
    		price: 310e15,
    	}, {
    		name: "JavaScript Console",
    		cps: 1.1e12,
    		price: 71e18,
    	}, {
    		name: "Idleverse",
    		cps: 8.3e12,
    		price: 12e21,
    	},
    ];

    function calculateCurrentPrice(item, amount) {
    	// return (((amount + 1) * priceIncreaseIncrease + 2 * priceIncrease) * amount + 2 * price) / 2;
    	return Math.ceil(item?.price * Math.pow(1.15, amount));
    }

    const cookiesPerClick = writable(1);

    const _cookies = writable(0);
    const cookies = {
    	..._cookies,
    	click() {
    		_cookies.update(n => n + get_store_value(cookiesPerClick));
    	},
    	increment(amount) {
    		_cookies.update(n => n + amount);
    	},
    	purchase(price) {
    		if (get_store_value(_cookies) >= price) {
    			_cookies.update(n => n - price);
    			return true;
    		} else {
    			return false;
    		}
    	}
    };

    const _items = writable(itemData.map(_ => 0));
    const items = {
    	..._items,
    	buy(item_idx, amount) {
    		_items.update(xs => {
    			xs[item_idx] = xs[item_idx] + amount;
    			return xs;
    		});
    	}
    };

    const _itemCps = derived(items, $items => $items.reduce((acc, item_amt, idx) => acc + (itemData[idx].cps * item_amt), 0));
    const itemCps = {
    	..._itemCps,
    	get: () => get_store_value(_itemCps)
    };

    const sesameOpened = writable(false);

    function floatToString(x, prec = 2) {
    	/*
    	const badStr = x.toFixed(prec);
    	const betterStr = badStr.replace(/^0+(?=\d\.)|0+$/g, '');
    	if (betterStr.endsWith('.')) {
    		return betterStr.slice(0, -1);
    	} else {
    		return betterStr;
    	}
    	*/
    	if (x < 1) {
    		return parseFloat(+x.toFixed(prec)).toString();
    	} else {
    		return humanFormat(x, { decimals: prec });
    	}
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }

    /* src/Cookie.svelte generated by Svelte v3.43.0 */
    const file$3 = "src/Cookie.svelte";

    function create_fragment$3(ctx) {
    	let button;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/cookie.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Cookie");
    			attr_dev(img, "class", "svelte-winei8");
    			add_location(img, file$3, 15, 1, 397);
    			attr_dev(button, "class", "svelte-winei8");
    			toggle_class(button, "focus-active", /*isFocusActive*/ ctx[0]);
    			add_location(button, file$3, 14, 0, 289);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, img);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "click", cookies.click, false, false, false),
    					listen_dev(button, "keydown", /*keyDown*/ ctx[1], false, false, false),
    					listen_dev(button, "keyup", /*keyUp*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isFocusActive*/ 1) {
    				toggle_class(button, "focus-active", /*isFocusActive*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Cookie', slots, []);
    	let isFocusActive = false;

    	function keyDown(e) {
    		if (e.code == 'Enter') $$invalidate(0, isFocusActive = true);

    		if (e.repeat) {
    			e.preventDefault();
    			return false;
    		}
    	}

    	function keyUp(e) {
    		if (e.code == 'Enter') $$invalidate(0, isFocusActive = false);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Cookie> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ cookies, isFocusActive, keyDown, keyUp });

    	$$self.$inject_state = $$props => {
    		if ('isFocusActive' in $$props) $$invalidate(0, isFocusActive = $$props.isFocusActive);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [isFocusActive, keyDown, keyUp];
    }

    class Cookie extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Cookie",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Items.svelte generated by Svelte v3.43.0 */
    const file$2 = "src/Items.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	child_ctx[8] = i;
    	return child_ctx;
    }

    // (39:0) {#each $items as itemAmount, idx}
    function create_each_block(ctx) {
    	let tr;
    	let td0;
    	let t0_value = floatToString(/*itemAmount*/ ctx[6]) + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = itemData[/*idx*/ ctx[8]].name + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = floatToString(calculateCurrentPrice(itemData[/*idx*/ ctx[8]], /*itemAmount*/ ctx[6])) + "";
    	let t4;
    	let t5;
    	let td3;
    	let button;
    	let t6;
    	let button_disabled_value;
    	let t7;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[5](/*idx*/ ctx[8], /*itemAmount*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			button = element("button");
    			t6 = text("Buy");
    			t7 = space();
    			attr_dev(td0, "class", "svelte-1e03ziv");
    			add_location(td0, file$2, 40, 1, 1049);
    			attr_dev(td1, "class", "svelte-1e03ziv");
    			add_location(td1, file$2, 41, 1, 1087);
    			attr_dev(td2, "class", "svelte-1e03ziv");
    			add_location(td2, file$2, 42, 1, 1118);
    			button.disabled = button_disabled_value = calculateCurrentPrice(itemData[/*idx*/ ctx[8]], /*itemAmount*/ ctx[6]) > /*$cookies*/ ctx[0];
    			attr_dev(button, "class", "svelte-1e03ziv");
    			add_location(button, file$2, 43, 5, 1198);
    			attr_dev(td3, "class", "svelte-1e03ziv");
    			add_location(td3, file$2, 43, 1, 1194);
    			attr_dev(tr, "class", "svelte-1e03ziv");
    			toggle_class(tr, "hidden", /*isHidden*/ ctx[3](/*idx*/ ctx[8], /*itemAmount*/ ctx[6]));
    			toggle_class(tr, "semihidden", /*isSemiHidden*/ ctx[4](/*idx*/ ctx[8], /*itemAmount*/ ctx[6]));
    			add_location(tr, file$2, 39, 0, 953);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, button);
    			append_dev(button, t6);
    			append_dev(tr, t7);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*$items*/ 2 && t0_value !== (t0_value = floatToString(/*itemAmount*/ ctx[6]) + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$items*/ 2 && t4_value !== (t4_value = floatToString(calculateCurrentPrice(itemData[/*idx*/ ctx[8]], /*itemAmount*/ ctx[6])) + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*$items, $cookies*/ 3 && button_disabled_value !== (button_disabled_value = calculateCurrentPrice(itemData[/*idx*/ ctx[8]], /*itemAmount*/ ctx[6]) > /*$cookies*/ ctx[0])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}

    			if (dirty & /*isHidden, $items*/ 10) {
    				toggle_class(tr, "hidden", /*isHidden*/ ctx[3](/*idx*/ ctx[8], /*itemAmount*/ ctx[6]));
    			}

    			if (dirty & /*isSemiHidden, $items*/ 18) {
    				toggle_class(tr, "semihidden", /*isSemiHidden*/ ctx[4](/*idx*/ ctx[8], /*itemAmount*/ ctx[6]));
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(39:0) {#each $items as itemAmount, idx}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let table;
    	let thead;
    	let tr;
    	let th0;
    	let t1;
    	let th1;
    	let t3;
    	let th2;
    	let t5;
    	let th3;
    	let t7;
    	let tbody;
    	let each_value = /*$items*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			table = element("table");
    			thead = element("thead");
    			tr = element("tr");
    			th0 = element("th");
    			th0.textContent = "Amount";
    			t1 = space();
    			th1 = element("th");
    			th1.textContent = "Name";
    			t3 = space();
    			th2 = element("th");
    			th2.textContent = "Price";
    			t5 = space();
    			th3 = element("th");
    			th3.textContent = "Buy";
    			t7 = space();
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(th0, file$2, 31, 2, 831);
    			add_location(th1, file$2, 32, 2, 849);
    			add_location(th2, file$2, 33, 2, 865);
    			add_location(th3, file$2, 34, 2, 882);
    			add_location(tr, file$2, 30, 1, 824);
    			add_location(thead, file$2, 29, 0, 815);
    			add_location(tbody, file$2, 37, 0, 911);
    			add_location(table, file$2, 28, 0, 807);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, table, anchor);
    			append_dev(table, thead);
    			append_dev(thead, tr);
    			append_dev(tr, th0);
    			append_dev(tr, t1);
    			append_dev(tr, th1);
    			append_dev(tr, t3);
    			append_dev(tr, th2);
    			append_dev(tr, t5);
    			append_dev(tr, th3);
    			append_dev(table, t7);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*isHidden, $items, isSemiHidden, calculateCurrentPrice, itemData, $cookies, makePurchase, floatToString*/ 31) {
    				each_value = /*$items*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(table);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $cookies;
    	let $items;
    	validate_store(cookies, 'cookies');
    	component_subscribe($$self, cookies, $$value => $$invalidate(0, $cookies = $$value));
    	validate_store(items, 'items');
    	component_subscribe($$self, items, $$value => $$invalidate(1, $items = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Items', slots, []);

    	function makePurchase(itemIdx, currentAmount) {
    		if (!cookies.purchase(calculateCurrentPrice(itemData[itemIdx], currentAmount))) {
    			alert("Not enough cookies");
    		} else {
    			items.buy(itemIdx, 1);
    		}
    	}

    	function isHidden(idx, amount, doRecursion = true) {
    		if (idx < 0) {
    			return false;
    		}

    		if ($items[idx] > 0) {
    			return false;
    		}

    		const thisItemPrice = calculateCurrentPrice(itemData[idx], amount);

    		if (doRecursion && !isHidden(idx - 1, amount, false)) {
    			return false;
    		}

    		return thisItemPrice > $cookies;
    	}

    	function isSemiHidden(idx, amount) {
    		return isHidden(idx, amount) && !isHidden(idx - 1, amount);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Items> was created with unknown prop '${key}'`);
    	});

    	const click_handler = (idx, itemAmount) => makePurchase(idx, itemAmount);

    	$$self.$capture_state = () => ({
    		cookies,
    		items,
    		itemData,
    		calculateCurrentPrice,
    		floatToString,
    		makePurchase,
    		isHidden,
    		isSemiHidden,
    		$cookies,
    		$items
    	});

    	return [$cookies, $items, makePurchase, isHidden, isSemiHidden, click_handler];
    }

    class Items extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Items",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Sesame.svelte generated by Svelte v3.43.0 */
    const file$1 = "src/Sesame.svelte";

    function create_fragment$1(ctx) {
    	let aside;
    	let label;
    	let input;
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			aside = element("aside");
    			label = element("label");
    			input = element("input");
    			t0 = text("\n\tNew cookies");
    			t1 = space();
    			button = element("button");
    			button.textContent = "Set";
    			attr_dev(input, "type", "number");
    			add_location(input, file$1, 7, 1, 106);
    			add_location(label, file$1, 6, 1, 97);
    			add_location(button, file$1, 10, 1, 176);
    			add_location(aside, file$1, 5, 0, 88);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, aside, anchor);
    			append_dev(aside, label);
    			append_dev(label, input);
    			set_input_value(input, /*newCookies*/ ctx[0]);
    			append_dev(label, t0);
    			append_dev(aside, t1);
    			append_dev(aside, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[1]),
    					listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*newCookies*/ 1 && to_number(input.value) !== /*newCookies*/ ctx[0]) {
    				set_input_value(input, /*newCookies*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(aside);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sesame', slots, []);
    	let newCookies = 0;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Sesame> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		newCookies = to_number(this.value);
    		$$invalidate(0, newCookies);
    	}

    	const click_handler = () => cookies.set(newCookies);
    	$$self.$capture_state = () => ({ cookies, items, newCookies });

    	$$self.$inject_state = $$props => {
    		if ('newCookies' in $$props) $$invalidate(0, newCookies = $$props.newCookies);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [newCookies, input_input_handler, click_handler];
    }

    class Sesame extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sesame",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.43.0 */
    const file = "src/App.svelte";

    // (21:1) {#if $sesameOpened}
    function create_if_block(ctx) {
    	let div;
    	let sesame;
    	let div_transition;
    	let current;
    	sesame = new Sesame({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(sesame.$$.fragment);
    			set_style(div, "grid-area", "sesame");
    			add_location(div, file, 21, 1, 766);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(sesame, div, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sesame.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, true);
    				div_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sesame.$$.fragment, local);
    			if (!div_transition) div_transition = create_bidirectional_transition(div, slide, {}, false);
    			div_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(sesame);
    			if (detaching && div_transition) div_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(21:1) {#if $sesameOpened}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h2;
    	let t0_value = floatToString(/*$cookies*/ ctx[0]) + "";
    	let t0;
    	let t1;
    	let t2_value = (/*$cookies*/ ctx[0] == 1 ? '' : 's') + "";
    	let t2;
    	let t3;
    	let h5;
    	let t4_value = floatToString(/*$itemCps*/ ctx[1]) + "";
    	let t4;
    	let t5;
    	let t6;
    	let div0;
    	let cookie;
    	let t7;
    	let h3;
    	let t9;
    	let div1;
    	let items;
    	let t10;
    	let current;
    	cookie = new Cookie({ $$inline: true });
    	items = new Items({ $$inline: true });
    	let if_block = /*$sesameOpened*/ ctx[2] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h2 = element("h2");
    			t0 = text(t0_value);
    			t1 = text(" Cookie");
    			t2 = text(t2_value);
    			t3 = space();
    			h5 = element("h5");
    			t4 = text(t4_value);
    			t5 = text(" CPS from upgrades");
    			t6 = space();
    			div0 = element("div");
    			create_component(cookie.$$.fragment);
    			t7 = space();
    			h3 = element("h3");
    			h3.textContent = "Items";
    			t9 = space();
    			div1 = element("div");
    			create_component(items.$$.fragment);
    			t10 = space();
    			if (if_block) if_block.c();
    			set_style(h2, "grid-area", "title");
    			add_location(h2, file, 15, 1, 364);
    			set_style(h5, "grid-area", "subtitle");
    			set_style(h5, "align-self", "baseline");
    			add_location(h5, file, 16, 1, 458);
    			set_style(div0, "grid-area", "cookie");
    			attr_dev(div0, "id", "cookie-container");
    			attr_dev(div0, "class", "svelte-gsfym5");
    			add_location(div0, file, 17, 1, 560);
    			set_style(h3, "grid-area", "items-title");
    			set_style(h3, "align-self", "baseline");
    			add_location(h3, file, 18, 1, 631);
    			set_style(div1, "grid-area", "items");
    			add_location(div1, file, 19, 1, 698);
    			attr_dev(main, "class", "svelte-gsfym5");
    			add_location(main, file, 14, 0, 356);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h2);
    			append_dev(h2, t0);
    			append_dev(h2, t1);
    			append_dev(h2, t2);
    			append_dev(main, t3);
    			append_dev(main, h5);
    			append_dev(h5, t4);
    			append_dev(h5, t5);
    			append_dev(main, t6);
    			append_dev(main, div0);
    			mount_component(cookie, div0, null);
    			append_dev(main, t7);
    			append_dev(main, h3);
    			append_dev(main, t9);
    			append_dev(main, div1);
    			mount_component(items, div1, null);
    			append_dev(main, t10);
    			if (if_block) if_block.m(main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*$cookies*/ 1) && t0_value !== (t0_value = floatToString(/*$cookies*/ ctx[0]) + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*$cookies*/ 1) && t2_value !== (t2_value = (/*$cookies*/ ctx[0] == 1 ? '' : 's') + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*$itemCps*/ 2) && t4_value !== (t4_value = floatToString(/*$itemCps*/ ctx[1]) + "")) set_data_dev(t4, t4_value);

    			if (/*$sesameOpened*/ ctx[2]) {
    				if (if_block) {
    					if (dirty & /*$sesameOpened*/ 4) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(cookie.$$.fragment, local);
    			transition_in(items.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(cookie.$$.fragment, local);
    			transition_out(items.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(cookie);
    			destroy_component(items);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $cookies;
    	let $itemCps;
    	let $sesameOpened;
    	validate_store(cookies, 'cookies');
    	component_subscribe($$self, cookies, $$value => $$invalidate(0, $cookies = $$value));
    	validate_store(itemCps, 'itemCps');
    	component_subscribe($$self, itemCps, $$value => $$invalidate(1, $itemCps = $$value));
    	validate_store(sesameOpened, 'sesameOpened');
    	component_subscribe($$self, sesameOpened, $$value => $$invalidate(2, $sesameOpened = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	setInterval(
    		() => {
    			cookies.increment(itemCps.get());
    		},
    		1000
    	);

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		cookies,
    		itemCps,
    		sesameOpened,
    		floatToString,
    		slide,
    		Cookie,
    		Items,
    		Sesame,
    		$cookies,
    		$itemCps,
    		$sesameOpened
    	});

    	return [$cookies, $itemCps, $sesameOpened];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.body
    });

    function openSesame() {
    	sesameOpened.update(x => !x);
    }
    app.openSesame = openSesame;

    return app;

})();
//# sourceMappingURL=bundle.js.map
