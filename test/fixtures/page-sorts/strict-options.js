// A page sort that rejects any option it does not declare, in its factory and in validatePageSortSettings. Packages
// written like this break when pkc-js hands them an option they never declared, such as a removed reserved option
// still stored in an upgraded community's settings (REMOVED_PAGE_SORT_OPTION_NAMES).

const DECLARED_OPTIONS = ["strictness"];

const assertOnlyDeclaredOptions = (pageSortSettings) => {
    const undeclared = Object.keys(pageSortSettings.options ?? {}).filter((option) => !DECLARED_OPTIONS.includes(option));
    if (undeclared.length > 0) throw Error(`strict-options sort does not accept options ${undeclared.join(", ")}`);
};

export default function strictOptionsPageSort({ pageSortSettings }) {
    assertOnlyDeclaredOptions(pageSortSettings);
    return {
        sortName: "strict",
        description: "Newest first, and rejects any option it does not declare",
        scope: "posts",
        optionInputs: [{ option: "strictness", label: "Strictness", description: "Unused, declared so the file has an option" }],
        validatePageSortSettings({ pageSortSettings }) {
            assertOnlyDeclaredOptions(pageSortSettings);
        },
        score({ comment }) {
            return comment.timestamp;
        }
    };
}
