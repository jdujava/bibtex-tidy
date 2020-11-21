type BibTeXFieldDatatype =
	| 'concatinate'
	| 'braced'
	| 'quoted'
	| 'number'
	| 'identifier';
type BibTexValue = string | bigint | SingleField[];

type SingleField = {
	name: string;
	datatype: Exclude<BibTeXFieldDatatype, 'concatinate'>;
	value: Exclude<BibTexValue, SingleField[]>;
	raw: string;
};

type ConcatField = {
	name: string;
	datatype: 'concatinate';
	value: SingleField[];
	raw: string;
};

type BibTexField = SingleField | ConcatField;

type BibTeXString = {
	itemtype: 'string';
	name: string;
	raw: string;
};
type BibTeXComment = {
	itemtype: 'comment';
	comment: string;
};
type BibTeXPreamble = {
	itemtype: 'preamble';
	raw: string;
};
interface BibTeXEntry {
	itemtype: 'entry';
	key?: string;
	type: string;
	fields: BibTexField[];
}

interface BibTeXEntry {
	fieldMap: Map<string, ValueString>;
	duplicate?: boolean;
}

interface ValueString {
	value: string;
	datatype: BibTeXFieldDatatype;
}

type BibTeXItem = BibTeXString | BibTeXEntry | BibTeXPreamble | BibTeXComment;

type CharacterMapping = [string, string];

type SortIndex = Map<string, string>;

type DuplicateKeyWarning = {
	code: 'DUPLICATE_KEY';
	message: string;
	entry: BibTeXItem;
};

type MissingKeyWarning = {
	code: 'MISSING_KEY';
	message: string;
	entry: BibTeXItem;
};

type DuplicateEntryWarning = {
	code: 'DUPLICATE_ENTRY';
	message: string;
	entry: BibTeXItem;
	duplicateOf: BibTeXItem;
};

type Warning = DuplicateKeyWarning | MissingKeyWarning | DuplicateEntryWarning;

declare module '*.tsv' {
	const value: CharacterMapping[];
	export default value;
}

declare module '*.pegjs' {
	export function parse(input: string): BibTeXItem[];
}

type OptionValue = string | boolean | number | string[];

type OptionDescription = {
	key: keyof import('./options').Options;
	cli: string;
	description: string;
	examples?: string[];
	type: 'array' | 'number' | 'boolean';
	default: OptionValue;
	deprecated: boolean;
};

declare module 'DOCS' {
	const options: OptionDescription[];
	export default options;
}

type BibTeXTidyResult = {
	bibtex: string;
	warnings: Warning[];
	entries: BibTeXEntry[];
};
