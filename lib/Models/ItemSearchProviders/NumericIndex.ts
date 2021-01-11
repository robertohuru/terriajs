import joinUrl from "./joinUrl";
import loadCsv from "./loadCsv";
import binarySearch from "terriajs-cesium/Source/Core/binarySearch";

// Minimum and maxiumum values in a numeric range
export type NumericRange = { min: number; max: number };

// Start and end numbers
type NumericSearchQuery = {
  start: number;
  end: number;
};

/**
 * An index used for searching numeric values.
 *
 * It is represented as an array of [id, value] pairs sorted by the value.
 * Searching is done by performing a binary search on the array.
 */
export default class NumericIndex {
  readonly type = "numeric";

  private idValuePairs?: { dataRowId: number; value: number }[];

  /**
   * Constructs a NumericIndex.
   *
   * @param url    Url of the NumericIndex CSV file. This could be a relative URL.
   * @param range  The maximum and minimum value in the index.
   */
  constructor(readonly url: string, readonly range: NumericRange) {}

  /**
   * Load a numeric index.
   *
   * @param indexRootUrl   The URL of the index root directory
   * @param _valueHint     Ignored for NumericIndex.
   */
  async load(
    indexRootUrl: string,
    _valueHint: NumericSearchQuery
  ): Promise<void> {
    if (this.idValuePairs) return;
    const indexUrl = joinUrl(indexRootUrl, this.url);
    this.idValuePairs = await loadCsv(indexUrl, {
      dynamicTyping: true,
      header: true
    });
  }

  /**
   * Search the numeric index for values between the start and end value in NumericSearchQuery.
   *
   * @param value The start and end value to be searched.
   * @return Set of IDs that matches the search value.
   */
  search(value: NumericSearchQuery): Set<number> {
    if (!this.idValuePairs) throw new Error(`Index not loaded`);
    const range = this.range;
    const idValuePairs = this.idValuePairs;
    const startValue = value.start === undefined ? range.min : value.start;
    const endValue = value.end === undefined ? range.max : value.end;
    const i = binarySearch(
      idValuePairs,
      { value: startValue },
      (a, b) => a.value - b.value
    );
    const j = binarySearch(
      idValuePairs,
      { value: endValue },
      (a, b) => a.value - b.value
    );
    const startIndex = i < 0 ? ~i : i;
    const endIndex = j < 0 ? ~j : j;
    const matchingIds = idValuePairs
      .slice(startIndex, endIndex + 1)
      .map(({ dataRowId }) => dataRowId);
    return new Set(matchingIds);
  }
}
