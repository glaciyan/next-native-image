import React from "react";
declare const VALID_LOADING_VALUES: readonly ["lazy", "eager", undefined];
declare type LoadingValue = typeof VALID_LOADING_VALUES[number];
export declare type ImageLoader = (resolverProps: ImageLoaderProps) => string;
export declare type ImageLoaderProps = {
    src: string;
    width: number;
    quality?: number;
};
declare const VALID_LAYOUT_VALUES: readonly ["fill", "fixed", "intrinsic", "responsive", "native", undefined];
declare type LayoutValue = typeof VALID_LAYOUT_VALUES[number];
declare type ImgElementStyle = NonNullable<JSX.IntrinsicElements["img"]["style"]>;
export declare type ImageProps = Omit<JSX.IntrinsicElements["img"], "src" | "srcSet" | "ref" | "width" | "height" | "loading" | "style"> & {
    src: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: LoadingValue;
    unoptimized?: boolean;
    objectFit?: ImgElementStyle["objectFit"];
    objectPosition?: ImgElementStyle["objectPosition"];
} & ({
    width?: never;
    height?: never;
    /** @deprecated Use `layout="fill"` instead */
    unsized: true;
    style?: never;
} | {
    width?: never;
    height?: never;
    layout: "fill";
    style?: never;
} | {
    width: number | string;
    height?: never;
    layout: "native";
    style?: React.CSSProperties;
} | {
    style?: never;
    width: number | string;
    height: number | string;
    layout?: Exclude<Exclude<LayoutValue, "fill">, "native">;
});
export default function Image({ src, sizes, unoptimized, priority, loading, className, quality, width, height, objectFit, objectPosition, loader, style, ...all }: ImageProps): JSX.Element;
export {};
//# sourceMappingURL=index.d.ts.map