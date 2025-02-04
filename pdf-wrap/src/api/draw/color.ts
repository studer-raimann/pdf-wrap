import {Logger} from "typescript-logging";
import {LoggerFactory} from "../../log-config";

export type HexPattern = "#XXXXXX" | "#XXXXXXXX" | "XXXXXX" | "XXXXXXXX";

/**
 * Predefined colors for a {@link Color} instance.
 *
 * @author Nicolas Märchy <nm@studer-raimann.ch>
 * @since 0.0.1
 */
export enum Colors {
    BLACK = "000000FF",
    WHITE = "FFFFFFFF",
    CYAN = "00FFFFFF",
    MAGENTA = "FF00FFFF",
    YELLOW = "FFFF00FF",
    RED = "FF0000FF",
    GREEN = "00FF00FF",
    BLUE = "0000FFFF",
    GREY = "808080FF",
    NONE = "FFFFFF00"
}

/**
 * Holds information about a color like the hex value.
 *
 * @author Nicolas Märchy <nm@studer-raimann.ch>
 * @since 0.0.1
 */
export interface Color {
    readonly red: number;
    readonly green: number;
    readonly blue: number;
    readonly alpha: number;

    /**
     * The hex value can be formatted by a pattern.
     * - #XXXXXX = #FFFFFF (normal)
     * - #XXXXXXXX = #FFFFFFFF (normal with alpha value)
     * - XXXXXX = FFFFFF (normal without beginning #)
     * - XXXXXXXX = FFFFFFFF (normal with alpha value, but without beginning #)
     *
     * The default format is: #XXXXXXXX
     *
     * @param {HexPattern} format - a valid format
     *
     * @returns {string} the formatted hex value
     */
    hex(format?: HexPattern): string;
}

/**
 * Creates a {@link Color} instance from a {@link Colors} value.
 *
 * @since 0.0.1
 *
 * @param {Colors} color - predefined color to create a color from
 *
 * @returns {Color} the created color
 */
export function colorFrom(color: Colors): Color {
    return colorFromHex(color);
}

/**
 * Creates a {@link Color} instance from rgba values.
 *
 * @since 0.0.1
 *
 * @param {number} red - red intensity as an integer between 0 and 255
 * @param {number} green - green intensity as an integer between 0 and 255
 * @param {number} blue - blue intensity as an integer between 0 and 255
 * @param {number} alpha - the opacity as a number between 0.0 (fully transparent) and 1.0 (full opaque)
 *
 * @returns {Color} the created color
 * @throws {IllegalColorValue} if one of the given arguments is invalid
 */
export function colorFromRgba(red: number, green: number, blue: number, alpha: number = 1): Color {

    const log: Logger = LoggerFactory.getLogger("ch/studerraimann/pdfwrap/api/draw/color:colorFromRgba");

    if (!isColorValue(red)) {
            throw new IllegalColorValue(`Parameter red is not a valid color value: red=${red}`);
    }

    if (!isColorValue(green)) {
        throw new IllegalColorValue(`Parameter green is not a valid color value: green=${green}`);
    }

    if (!isColorValue(blue)) {
        throw new IllegalColorValue(`Parameter blue is not a valid color value: blue=${blue}`);
    }

    if (!isAlphaValue(alpha)) {
        throw new IllegalColorValue(`Parameter alpha is not a valid alpha value: alpha=${alpha}`);
    }

    log.trace(() => `Create a color from rgba: rgba=${red}, ${green}, ${blue}, ${alpha}`);
    return new SimpleColor(red, green, blue, alpha);
}

/**
 * Creates a {@link Color} instance from the given hex color value.
 *
 *
 * Valid hex values are:
 * - FFFFFF (normal)
 * - FFF (short)
 * - FFFFFFFF (with alpha value)
 * - FFFF (short with alpha value)
 *
 * The value is case insensitive (FFFFFF = ffffff).
 * {@See https://drafts.csswg.org/css-color/#hex-notation} for more information.
 *
 * @since 0.3.0
 *
 * @param {string} value - a valid hex color value
 *
 * @returns {Color} the created color
 * @throws {IllegalColorValue} if the given hex color value is invalid
 */
export function colorFromHex(value: string): Color {

    const hex: string = (value.startsWith("#")) ? value.substring(1, value.length) : value;

    if (HEX_COLOR_SHORT_REGX.test(hex)) {

        const groups: RegExpMatchArray = HEX_COLOR_SHORT_REGX.exec(hex) as RegExpExecArray;

        const redHex: string = `${groups[1]}${groups[1]}`;
        const greenHex: string = `${groups[2]}${groups[2]}`;
        const blueHex: string = `${groups[3]}${groups[3]}`;

        return colorFromRgba(parseInt(redHex, 16), parseInt(greenHex, 16), parseInt(blueHex, 16));
    }

    if (HEX_COLOR_SHORT_ALPHA_REGX.test(hex)) {

        const groups: RegExpMatchArray = HEX_COLOR_SHORT_ALPHA_REGX.exec(hex) as RegExpExecArray;

        const redHex: string = `${groups[1]}${groups[1]}`;
        const greenHex: string = `${groups[2]}${groups[2]}`;
        const blueHex: string = `${groups[3]}${groups[3]}`;
        const alpha: number = Math.floor(hexToDec(`${groups[4]}${groups[4]}`) / 2.55) / 100;

        return colorFromRgba(parseInt(redHex, 16), parseInt(greenHex, 16), parseInt(blueHex, 16), alpha);
    }

    if (HEX_COLOR_ALPHA_REGX.test(hex)) {

        const groups: RegExpMatchArray = HEX_COLOR_ALPHA_REGX.exec(hex) as RegExpExecArray;

        const redHex: string = `${groups[1]}`;
        const greenHex: string = `${groups[2]}`;
        const blueHex: string = `${groups[3]}`;
        const alpha: number = Math.floor(hexToDec(groups[4]) / 2.55) / 100;

        return colorFromRgba(parseInt(redHex, 16), parseInt(greenHex, 16), parseInt(blueHex, 16), alpha);
    }

    if (HEX_COLOR_REGX.test(hex)) {

        const groups: RegExpMatchArray = HEX_COLOR_REGX.exec(hex) as RegExpExecArray;

        const redHex: string = `${groups[1]}`;
        const greenHex: string = `${groups[2]}`;
        const blueHex: string = `${groups[3]}`;

        return colorFromRgba(parseInt(redHex, 16), parseInt(greenHex, 16), parseInt(blueHex, 16));
    }

    throw new IllegalColorValue(`Parameter value is not a valid hex color value: value=${value}`);
}

/**
 * Indicates an illegal value used to identify a color.
 *
 * @author Nicolas Märchy <nm@studer-raimann.ch>
 * @since 0.0.1
 */
export class IllegalColorValue extends Error {}


const HEX: number = 16;

const HEX_COLOR_SHORT_REGX: RegExp = /^([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])$/;
const HEX_COLOR_SHORT_ALPHA_REGX: RegExp = /^([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])([A-Fa-f0-9])$/;
const HEX_COLOR_REGX: RegExp = /^([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})$/;
const HEX_COLOR_ALPHA_REGX: RegExp = /^([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})$/;

function decToHex(decimal: number): string {
    decimal = Math.round(decimal);
    if (decimal < 16) {
        return `0${decimal.toString(HEX).toUpperCase()}`;
    }

    return decimal.toString(HEX).toUpperCase();
}

function alphaToHex(alpha: number): string {
    return decToHex(Math.round(alpha * 255));
}

function hexToDec(value: string): number {
    return parseInt(value, 16);
}

function isColorValue(value: number): boolean {
    return value < 256 && value >= 0;
}

function isAlphaValue(value: number): boolean {
    return value >= 0 && value <= 1;
}

class SimpleColor implements Color {

    private readonly hexAlpha: string;
    private readonly hexRed: string;
    private readonly hexGreen: string;
    private readonly hexBlue: string;

    constructor(
        readonly red: number,
        readonly green: number,
        readonly blue: number,
        readonly alpha: number
    ) {
        this.hexAlpha = alphaToHex(alpha);
        this.hexRed = decToHex(red);
        this.hexGreen = decToHex(green);
        this.hexBlue = decToHex(blue);
    }

    hex(format: HexPattern = "#XXXXXXXX"): string {

        switch (format) {
            case "#XXXXXX":
                return `#${this.hexRed}${this.hexGreen}${this.hexBlue}`;

            case "XXXXXX":
                return `${this.hexRed}${this.hexGreen}${this.hexBlue}`;

            case "XXXXXXXX":
                return `${this.hexRed}${this.hexGreen}${this.hexBlue}${this.hexAlpha}`;

            default:
                return `#${this.hexRed}${this.hexGreen}${this.hexBlue}${this.hexAlpha}`;
        }
    }
}
