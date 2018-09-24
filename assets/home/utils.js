import { get } from 'lodash';

export function getNavigationImageUrl(navigation) {
    if (get(navigation, 'tile_images.length', 0) === 0) {
        return null;
    }

    const urls = get(navigation, 'tile_images', []).map((image) => image.file_url).filter((url) => url);

    if (urls.length === 1) {
        return urls[0];
    } else {
        const max = urls.length - 1;
        const min = 0;
        return urls[Math.floor(Math.random() * (max - min + 1)) + min];
    }
}