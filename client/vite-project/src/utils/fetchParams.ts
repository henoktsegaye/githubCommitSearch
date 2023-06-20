export function optionsToUrl(url: string, options: Record<string, any>) {

    var optionsKey = Object.keys(options);
    var optionsKeyLength = optionsKey.length;

    for (var i = 0; i < optionsKeyLength; i++) {
        if (i == 0) {
            url += `?${encodeURIComponent(optionsKey[i])}=${encodeURIComponent(options[optionsKey[i]])}`;
            continue
        }
        url += `&${encodeURIComponent(optionsKey[i])}=${encodeURIComponent(options[optionsKey[i]])}`;
    }
    return url;
}