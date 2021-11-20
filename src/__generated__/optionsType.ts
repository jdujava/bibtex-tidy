/**
 * bibtex-tidy v1.8.3
 * https://github.com/FlamingTempura/bibtex-tidy
 *
 * DO NOT EDIT THIS FILE. This file is automatically generated
 * using `npm run build`. Edit files in './src' then rebuild.
 **/

export type BibTeXTidyOptions = {
	/**
	 * Help
	 *
	 * Show help
	 */
	help?: boolean;
	/**
	 * Remove fields
	 *
	 * Remove specified fields from bibliography entries.
	 */
	omit?: string[];
	/**
	 * Enclose values in braces
	 *
	 * Enclose all property values in braces. Quoted values will be converted to braces. For example, "Journal of Tea" will become {Journal of Tea}.
	 */
	curly?: boolean;
	/**
	 * Use numeric values where possible
	 *
	 * Strip quotes and braces from numeric/month values. For example, {1998} will become 1998.
	 */
	numeric?: boolean;
	/**
	 * Indent with spaces
	 *
	 * Indent all fields with the specified number of spaces. Ignored if tab is set.
	 */
	space?: boolean | number;
	/**
	 * Indent with tabs
	 *
	 * Intent all fields with a tab.
	 */
	tab?: boolean;
	/**
	 * Align values
	 *
	 * Insert whitespace between fields and values so that values are visually aligned.
	 */
	align?: boolean | number;
	/**
	 * Sort bibliography entries
	 *
	 * Sort entries by specified fields. For descending order, prefix the field with a dash (-).
	 */
	sort?: boolean | string[];
	/**
	 * Check for duplicates
	 *
	 * Warn if duplicates are found, which are entries where DOI, abstract, or author and title are the same.
	 */
	duplicates?: boolean | ('doi' | 'key' | 'abstract' | 'citation')[];
	/**
	 * Merge duplicate entries
	 *
	 * Merge duplicates entries. Use the duplicates option to determine how duplicates are identified. There are different ways to merge:
	 * - first: only keep the original entry
	 * - last: only keep the last found duplicate
	 * - combine: keep original entry and merge in fields of duplicates if they do not already exist
	 * - overwrite: keep original entry and merge in fields of duplicates, overwriting existing fields if they exist
	 */
	merge?: boolean | 'first' | 'last' | 'combine' | 'overwrite';
	/**
	 * Strip double-braced values
	 *
	 * Where an entire value is enclosed in double braces, remove the extra braces. For example, {{Journal of Tea}} will become {Journal of Tea}.
	 */
	stripEnclosingBraces?: boolean;
	/**
	 * Drop all caps
	 *
	 * Where values are all caps, make them title case. For example, {JOURNAL OF TEA} will become {Journal of Tea}.
	 */
	dropAllCaps?: boolean;
	/**
	 * Escape special characters
	 *
	 * Escape special characters, such as umlaut. This ensures correct typesetting with latex. Enabled by default.
	 */
	escape?: boolean;
	/**
	 * Sort fields
	 *
	 * Sort the fields within entries.
	 * If no fields are specified fields will be sorted by: title, shorttitle, author, year, month, day, journal, booktitle, location, on, publisher, address, series, volume, number, pages, doi, isbn, issn, url, urldate, copyright, category, note, metadata
	 */
	sortFields?: boolean | string[];
	/**
	 * Sort properties
	 *
	 * Alias of sort fields (legacy)
	 */
	sortProperties?: boolean | string[];
	/**
	 * Remove comments
	 *
	 * Remove all comments from the bibtex source.
	 */
	stripComments?: boolean;
	/**
	 * Trailing commas
	 *
	 * End the last key value pair in each entry with a comma.
	 */
	trailingCommas?: boolean;
	/**
	 * Encode URLs
	 *
	 * Replace invalid URL characters with percent encoded values.
	 */
	encodeUrls?: boolean;
	/**
	 * Tidy comments
	 *
	 * Remove whitespace surrounding comments.
	 */
	tidyComments?: boolean;
	/**
	 * Remove empty fields
	 *
	 * Remove any fields that have empty values.
	 */
	removeEmptyFields?: boolean;
	/**
	 * Remove duplicate fields
	 *
	 * Only allow one of each field in each entry. Enabled by default.
	 */
	removeDuplicateFields?: boolean;
	/**
	 * Generate BibTeX keys
	 *
	 * [Experimental] For all entries replace the key with a new key of the form <author><year><title>.
	 */
	generateKeys?: boolean;
	/**
	 * Maximum authors
	 *
	 * Truncate authors if above a given number into "and others".
	 */
	maxAuthors?: number;
	/**
	 * Lowercase fields
	 *
	 * Lowercase field names and entry type. Enabled by default.
	 */
	lowercase?: boolean;
	/**
	 * Enclose values in double braces
	 *
	 * Enclose the given fields in double braces, such that case is preserved during BibTeX compilation.
	 */
	enclosingBraces?: boolean | string[];
	/**
	 * Wrap values
	 *
	 * Wrap long values at the given column
	 */
	wrap?: boolean | number;
	/**
	 * Version
	 *
	 * Show bibtex-tidy version.
	 */
	version?: boolean;
	/**
	 * Quiet
	 *
	 * Suppress logs and warnings.
	 */
	quiet?: boolean;
	/**
	 * Backup
	 *
	 * Make a backup <filename>.original. Enabled by default.
	 */
	backup?: boolean;
};
