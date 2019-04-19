export async function fetchData() {
    const dataURL = '/data.json';
    return await fetch(dataURL)
        .then((response) => {
            return response.json();
        });
}