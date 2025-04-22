const district_url = "https://bdapi.vercel.app/api/v.1/district";
const division_url = "https://bdapi.vercel.app/api/v.1/division";

let division_selector;
let district_selector;
let selected_div="";
let selected_dis="";
window.onload = () => {
    division_selector = document.getElementById("division");
    district_selector = document.getElementById("district");

    getDivision();

    division_selector.addEventListener("change", () => {
        const selectedDivisionId = division_selector.value;
        if (selectedDivisionId !== "Select") {
            getDistrict(selectedDivisionId);
        }
    });
};

const getDivision = async () => {
    const response = await fetch(division_url);
    const info = await response.json();
    const divisions = info.data;

    division_selector.innerHTML = '<option>Division</option>';

    Object.values(divisions).forEach(element => {
        const option = document.createElement("option");
        option.value = element.id;
        option.textContent = element.name;
        division_selector.appendChild(option);
    });
};

const getDistrict = async (divisionId) => {
    const response = await fetch(district_url);
    const info = await response.json();
    const districts = info.data;

    district_selector.innerHTML = '<option>District</option>';

    Object.values(districts)
        .forEach(item => {
            if (item.division_id == divisionId) {
                const option = document.createElement("option");
                option.value = item.id;
                option.textContent = item.name;
                district_selector.appendChild(option);
            }

        });
};
