import {Observable} from "rxjs";
import {PageChangeEvent} from "../event";
import { ZoomSettings } from "../zoom";
import {Outline, PageThumbnail} from "./document.info";
import {Toolbox} from "../tool";
import {Highlighting} from "../highlight";
import {DocumentSearch} from "../search";
import { ScalePreset } from "./document.scale";

/**
 * Describes a PDF document containing several meta information and document data.
 * In addition, it allows to modify the view where the PDF is displayed.
 *
 * @author Nicolas Märchy <nm@studer-raimann.ch>
 * @since 0.0.1
 */
export interface PDFDocument {

    /**
     * The scale of the PDF view.
     * May be changed to zoom in or out.
     */
    scale: number;

    /**
     * The page number of the current displayed page.
     * May be changed to jump to another page.
     */
    currentPageNumber: number;

    readonly pageCount: number;

    /**
     * A hot {@code Observable} which emits every time the displayed page is changed.
     */
    readonly pageChange: Observable<PageChangeEvent>;

    /**
     * A toolbox containing several tools to modify a PDF page.
     */
    readonly toolbox: Toolbox;

    /**
     * Zoom gesture settings.
     */
    readonly zoom: ZoomSettings;

    /**
     * Highlighting object to enable / disable or modify the text highlighting of a PDF page.
     */
    readonly highlighting: Highlighting;

    /**
     * Search controller to perform a document search
     */
    readonly searchController: DocumentSearch;

    /**
     * Scale pages to a predefined format.
     *
     * @param {ScalePreset} preset
     */
    scaleTo(preset: ScalePreset): void;

    /**
     * @returns {Promise<Outline>} the outline of a PDF
     */
    getOutline(): Promise<Outline>;

    /**
     * Returns a observable which emits a {@link PageThumbnail} for each given page number.
     * The observable completes when the last thumbnail is emitted.
     *
     * If the {@code maxSize} parameter is greater than the max width or height of the PDF page,
     * the size of the PDF page will be used.
     *
     * @param {number} maxSize - the max width or height of the thumbnails
     * @param {number} pageNumbers - the page numbers for the thumbnails that should be returned
     *
     * @returns {Observable<PageThumbnail>} a observable which emits the thumbnails
     */
    getThumbnails(maxSize: number, ...pageNumbers: Array<number>): Observable<PageThumbnail>;

    /**
     * Destroys allocated resources.
     * After this method call, the document is no longer functional.
     */
    close(): Promise<void>;
}
