"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// https://github.com/vercel/next.js/blob/canary/packages/next/client/image.tsx
var react_1 = __importDefault(require("react"));
var head_1 = __importDefault(require("next/head"));
var to_base_64_1 = require("next/dist/next-server/lib/to-base-64");
var image_config_1 = require("next/dist/next-server/server/image-config");
var use_intersection_1 = require("next/dist/client/use-intersection");
if (typeof window === "undefined") {
    global.__NEXT_IMAGE_IMPORTED = true;
}
var VALID_LOADING_VALUES = ["lazy", "eager", undefined];
var loaders = new Map([
    ["imgix", imgixLoader],
    ["cloudinary", cloudinaryLoader],
    ["akamai", akamaiLoader],
    ["default", defaultLoader],
]);
var VALID_LAYOUT_VALUES = [
    "fill",
    "fixed",
    "intrinsic",
    "responsive",
    "native",
    undefined,
];
var _a = process.env.__NEXT_IMAGE_OPTS || image_config_1.imageConfigDefault, configDeviceSizes = _a.deviceSizes, configImageSizes = _a.imageSizes, configLoader = _a.loader, configPath = _a.path, configDomains = _a.domains;
// sort smallest to largest
var allSizes = __spreadArray(__spreadArray([], __read(configDeviceSizes)), __read(configImageSizes));
configDeviceSizes.sort(function (a, b) { return a - b; });
allSizes.sort(function (a, b) { return a - b; });
function getWidths(width, layout, sizes) {
    if (sizes && (layout === "fill" || layout === "responsive")) {
        // Find all the "vw" percent sizes used in the sizes prop
        var percentSizes = __spreadArray([], __read(sizes.matchAll(/(^|\s)(1?\d?\d)vw/g))).map(function (m) {
            return parseInt(m[2]);
        });
        if (percentSizes.length) {
            var smallestRatio_1 = Math.min.apply(Math, __spreadArray([], __read(percentSizes))) * 0.01;
            return {
                widths: allSizes.filter(function (s) { return s >= configDeviceSizes[0] * smallestRatio_1; }),
                kind: "w",
            };
        }
        return { widths: allSizes, kind: "w" };
    }
    if (typeof width !== "number" ||
        layout === "fill" ||
        layout === "responsive") {
        return { widths: configDeviceSizes, kind: "w" };
    }
    var widths = __spreadArray([], __read(new Set(
    // > This means that most OLED screens that say they are 3x resolution,
    // > are actually 3x in the green color, but only 1.5x in the red and
    // > blue colors. Showing a 3x resolution image in the app vs a 2x
    // > resolution image will be visually the same, though the 3x image
    // > takes significantly more data. Even true 3x resolution screens are
    // > wasteful as the human eye cannot see that level of detail without
    // > something like a magnifying glass.
    // https://blog.twitter.com/engineering/en_us/topics/infrastructure/2019/capping-image-fidelity-on-ultra-high-resolution-devices.html
    [width, width * 2 /*, width * 3*/].map(function (w) { return allSizes.find(function (p) { return p >= w; }) || allSizes[allSizes.length - 1]; }))));
    return { widths: widths, kind: "x" };
}
function generateImgAttrs(_a) {
    var src = _a.src, unoptimized = _a.unoptimized, layout = _a.layout, width = _a.width, quality = _a.quality, sizes = _a.sizes, loader = _a.loader;
    if (unoptimized) {
        return { src: src, srcSet: undefined, sizes: undefined };
    }
    var _b = getWidths(width, layout, sizes), widths = _b.widths, kind = _b.kind;
    var last = widths.length - 1;
    return {
        sizes: !sizes && kind === "w" ? "100vw" : sizes,
        srcSet: widths
            .map(function (w, i) {
            return loader({ src: src, quality: quality, width: w }) + " " + (kind === "w" ? w : i + 1) + kind;
        })
            .join(", "),
        // It's intended to keep `src` the last attribute because React updates
        // attributes in order. If we keep `src` the first one, Safari will
        // immediately start to fetch `src`, before `sizes` and `srcSet` are even
        // updated by React. That causes multiple unnecessary requests if `srcSet`
        // and `sizes` are defined.
        // This bug cannot be reproduced in Chrome or Firefox.
        src: loader({ src: src, quality: quality, width: widths[last] }),
    };
}
function getInt(x) {
    if (typeof x === "number") {
        return x;
    }
    if (typeof x === "string") {
        return parseInt(x, 10);
    }
    return undefined;
}
function defaultImageLoader(loaderProps) {
    var load = loaders.get(configLoader);
    if (load) {
        return load(__assign({ root: configPath }, loaderProps));
    }
    throw new Error("Unknown \"loader\" found in \"next.config.js\". Expected: " + image_config_1.VALID_LOADERS.join(", ") + ". Received: " + configLoader);
}
function Image(_a) {
    var src = _a.src, sizes = _a.sizes, _b = _a.unoptimized, unoptimized = _b === void 0 ? false : _b, _c = _a.priority, priority = _c === void 0 ? false : _c, loading = _a.loading, className = _a.className, quality = _a.quality, width = _a.width, height = _a.height, objectFit = _a.objectFit, objectPosition = _a.objectPosition, _d = _a.loader, loader = _d === void 0 ? defaultImageLoader : _d, all = __rest(_a, ["src", "sizes", "unoptimized", "priority", "loading", "className", "quality", "width", "height", "objectFit", "objectPosition", "loader"]);
    var rest = all;
    var layout = sizes ? "responsive" : "intrinsic";
    var unsized = false;
    var native = false;
    if ("unsized" in rest) {
        unsized = Boolean(rest.unsized);
        // Remove property so it's not spread into image:
        delete rest["unsized"];
    }
    else if ("layout" in rest) {
        // Override default layout if the user specified one:
        if (rest.layout)
            layout = rest.layout;
        // Remove property so it's not spread into image:
        delete rest["layout"];
    }
    if (process.env.NODE_ENV !== "production") {
        if (!src) {
            throw new Error("Image is missing required \"src\" property. Make sure you pass \"src\" in props to the `next/image` component. Received: " + JSON.stringify({ width: width, height: height, quality: quality }));
        }
        if (!VALID_LAYOUT_VALUES.includes(layout)) {
            throw new Error("Image with src \"" + src + "\" has invalid \"layout\" property. Provided \"" + layout + "\" should be one of " + VALID_LAYOUT_VALUES.map(String).join(",") + ".");
        }
        if (!VALID_LOADING_VALUES.includes(loading)) {
            throw new Error("Image with src \"" + src + "\" has invalid \"loading\" property. Provided \"" + loading + "\" should be one of " + VALID_LOADING_VALUES.map(String).join(",") + ".");
        }
        if (priority && loading === "lazy") {
            throw new Error("Image with src \"" + src + "\" has both \"priority\" and \"loading='lazy'\" properties. Only one should be used.");
        }
        if (unsized) {
            throw new Error("Image with src \"" + src + "\" has deprecated \"unsized\" property, which was removed in favor of the \"layout='fill'\" property");
        }
    }
    var isLazy = !priority && (loading === "lazy" || typeof loading === "undefined");
    if (src && src.startsWith("data:")) {
        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs
        unoptimized = true;
        isLazy = false;
    }
    var _e = __read(use_intersection_1.useIntersection({
        rootMargin: "200px",
        disabled: !isLazy,
    }), 2), setRef = _e[0], isIntersected = _e[1];
    var isVisible = !isLazy || isIntersected;
    var widthInt = getInt(width);
    var heightInt = getInt(height);
    var qualityInt = getInt(quality);
    var wrapperStyle;
    var sizerStyle;
    var sizerSvg;
    var imgStyle = {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        boxSizing: "border-box",
        padding: 0,
        border: "none",
        margin: "auto",
        display: "block",
        width: 0,
        height: 0,
        minWidth: "100%",
        maxWidth: "100%",
        minHeight: "100%",
        maxHeight: "100%",
        objectFit: objectFit,
        objectPosition: objectPosition,
    };
    if (typeof widthInt !== "undefined" &&
        typeof heightInt !== "undefined" &&
        layout !== "fill" &&
        layout !== "native") {
        // <Image src="i.png" width="100" height="100" />
        var quotient = heightInt / widthInt;
        var paddingTop = isNaN(quotient) ? "100%" : quotient * 100 + "%";
        if (layout === "responsive") {
            // <Image src="i.png" width="100" height="100" layout="responsive" />
            wrapperStyle = {
                display: "block",
                overflow: "hidden",
                position: "relative",
                boxSizing: "border-box",
                margin: 0,
            };
            sizerStyle = { display: "block", boxSizing: "border-box", paddingTop: paddingTop };
        }
        else if (layout === "intrinsic") {
            // <Image src="i.png" width="100" height="100" layout="intrinsic" />
            wrapperStyle = {
                display: "inline-block",
                maxWidth: "100%",
                overflow: "hidden",
                position: "relative",
                boxSizing: "border-box",
                margin: 0,
            };
            sizerStyle = {
                boxSizing: "border-box",
                display: "block",
                maxWidth: "100%",
            };
            sizerSvg = "<svg width=\"" + widthInt + "\" height=\"" + heightInt + "\" xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\"/>";
        }
        else if (layout === "fixed") {
            // <Image src="i.png" width="100" height="100" layout="fixed" />
            wrapperStyle = {
                overflow: "hidden",
                boxSizing: "border-box",
                display: "inline-block",
                position: "relative",
                width: widthInt,
                height: heightInt,
            };
        }
    }
    else if (typeof widthInt === "undefined" &&
        typeof heightInt === "undefined" &&
        layout === "fill") {
        // <Image src="i.png" layout="fill" />
        wrapperStyle = {
            display: "block",
            overflow: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            boxSizing: "border-box",
            margin: 0,
        };
    }
    else if (layout === "native") {
        native = true;
    }
    else {
        // <Image src="i.png" />
        if (process.env.NODE_ENV !== "production") {
            throw new Error("Image with src \"" + src + "\" must use \"width\" and \"height\" properties or \"layout='fill'\" property.");
        }
    }
    var imgAttributes = {
        src: "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
        srcSet: undefined,
        sizes: undefined,
    };
    if (isVisible) {
        imgAttributes = generateImgAttrs({
            src: src,
            unoptimized: unoptimized,
            layout: layout,
            width: widthInt,
            quality: qualityInt,
            sizes: sizes,
            loader: loader,
        });
    }
    if (unsized || native) {
        wrapperStyle = undefined;
        sizerStyle = undefined;
        imgStyle = undefined;
    }
    var component = (react_1.default.createElement(react_1.default.Fragment, null,
        sizerStyle ? (react_1.default.createElement("div", { style: sizerStyle }, sizerSvg ? (react_1.default.createElement("img", { style: {
                maxWidth: "100%",
                display: "block",
                margin: 0,
                border: "none",
                padding: 0,
            }, alt: "", "aria-hidden": true, role: "presentation", src: "data:image/svg+xml;base64," + to_base_64_1.toBase64(sizerSvg) })) : null)) : null,
        !isVisible && (react_1.default.createElement("noscript", null,
            react_1.default.createElement("img", __assign({}, rest, generateImgAttrs({
                src: src,
                unoptimized: unoptimized,
                layout: layout,
                width: widthInt,
                quality: qualityInt,
                sizes: sizes,
                loader: loader,
            }), { src: src, decoding: "async", sizes: sizes, style: imgStyle, className: className })))),
        react_1.default.createElement("img", __assign({}, rest, imgAttributes, { decoding: "async", className: className, ref: setRef, style: imgStyle })),
        priority ? (
        // Note how we omit the `href` attribute, as it would only be relevant
        // for browsers that do not support `imagesrcset`, and in those cases
        // it would likely cause the incorrect image to be preloaded.
        //
        // https://html.spec.whatwg.org/multipage/semantics.html#attr-link-imagesrcset
        react_1.default.createElement(head_1.default, null,
            react_1.default.createElement("link", { key: "__nimg-" +
                    imgAttributes.src +
                    imgAttributes.srcSet +
                    imgAttributes.sizes, rel: "preload", as: "image", href: imgAttributes.srcSet ? undefined : imgAttributes.src, 
                // @ts-ignore: imagesrcset is not yet in the link element type
                imagesrcset: imgAttributes.srcSet, 
                // @ts-ignore: imagesizes is not yet in the link element type
                imagesizes: imgAttributes.sizes }))) : null));
    if (wrapperStyle) {
        return react_1.default.createElement("div", { style: wrapperStyle }, component);
    }
    else {
        return component;
    }
}
exports.default = Image;
//BUILT IN LOADERS
function normalizeSrc(src) {
    return src[0] === "/" ? src.slice(1) : src;
}
function imgixLoader(_a) {
    var root = _a.root, src = _a.src, width = _a.width, quality = _a.quality;
    // Demo: https://static.imgix.net/daisy.png?format=auto&fit=max&w=300
    var params = ["auto=format", "fit=max", "w=" + width];
    var paramsString = "";
    if (quality) {
        params.push("q=" + quality);
    }
    if (params.length) {
        paramsString = "?" + params.join("&");
    }
    return "" + root + normalizeSrc(src) + paramsString;
}
function akamaiLoader(_a) {
    var root = _a.root, src = _a.src, width = _a.width;
    return "" + root + normalizeSrc(src) + "?imwidth=" + width;
}
function cloudinaryLoader(_a) {
    var root = _a.root, src = _a.src, width = _a.width, quality = _a.quality;
    // Demo: https://res.cloudinary.com/demo/image/upload/w_300,c_limit,q_auto/turtles.jpg
    var params = [
        "f_auto",
        "c_limit",
        "w_" + width,
        "q_" + (quality || "auto"),
    ];
    var paramsString = params.join(",") + "/";
    return "" + root + paramsString + normalizeSrc(src);
}
function defaultLoader(_a) {
    var root = _a.root, src = _a.src, width = _a.width, quality = _a.quality;
    if (process.env.NODE_ENV !== "production") {
        var missingValues = [];
        // these should always be provided but make sure they are
        if (!src)
            missingValues.push("src");
        if (!width)
            missingValues.push("width");
        if (missingValues.length > 0) {
            throw new Error("Next Image Optimization requires " + missingValues.join(", ") + " to be provided. Make sure you pass them as props to the `next/image` component. Received: " + JSON.stringify({ src: src, width: width, quality: quality }));
        }
        if (src.startsWith("//")) {
            throw new Error("Failed to parse src \"" + src + "\" on `next/image`, protocol-relative URL (//) must be changed to an absolute URL (http:// or https://)");
        }
        if (!src.startsWith("/") && configDomains) {
            var parsedSrc = void 0;
            try {
                parsedSrc = new URL(src);
            }
            catch (err) {
                console.error(err);
                throw new Error("Failed to parse src \"" + src + "\" on `next/image`, if using relative image it must start with a leading slash \"/\" or be an absolute URL (http:// or https://)");
            }
            if (!configDomains.includes(parsedSrc.hostname)) {
                throw new Error("Invalid src prop (" + src + ") on `next/image`, hostname \"" + parsedSrc.hostname + "\" is not configured under images in your `next.config.js`\n" +
                    "See more info: https://nextjs.org/docs/messages/next-image-unconfigured-host");
            }
        }
    }
    return root + "?url=" + encodeURIComponent(src) + "&w=" + width + "&q=" + (quality || 75);
}
//# sourceMappingURL=index.js.map