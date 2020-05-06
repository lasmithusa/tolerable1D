// GENERAL / HELPERS //
function findSelected(list) {
    return list.querySelector("[selected]")
}


function getListChildren(list_id) {
    return document.getElementById(list_id).childNodes;
}



// VARIABLE MANAGEMENT (ADD, REMOVE, CLEAR) //
// handle variable click
function handleVariableClick(var_type, clicked_var) {
    // unselected whatever is selected and then select clicked item
    // if clicked item is already selected, unselect clicked item
    if (selected_var[var_type]) {
        selected_var[var_type].removeAttribute("selected");
    }

    if (selected_var[var_type] != event.target) {
        clicked_var.setAttribute("selected", "true");
        selected_var[var_type] = clicked_var;
        showDetailForm(var_type);
        loadStoredVariableDetails(var_type, selected_var[var_type].id);
    }
    else {
        selected_var[var_type] = null;
        hideDetailForm(var_type);
    }

};


// add variable
function addVariable(var_type) {
    switch(var_type) {
        case "independent":
            var_list_id = "independentlist";
            break;
        case "dependent":
            var_list_id = "dependentlist";
            break;
    }

    var_list = document.getElementById(var_list_id);
    next_id_number = var_list.querySelectorAll("li").length;

    var_list.insertAdjacentHTML("beforeend", generateNextVariable(next_id_number, var_type));

    var_list.lastChild.addEventListener("click", event => handleVariableClick(var_type, event.target));

    // unselected currently selected (if any) and select new variable
    handleVariableClick(var_type, var_list.lastChild);
}


function generateNextVariable(next_id_number, var_type) {
    switch(var_type) {
        case "independent":
            return `<li id="independent${next_id_number}" class="independent">
                    #${next_id_number + 1} - Independent${next_id_number + 1}
                    - Nominal: - Tolerance: </li>`;
        case "dependent":
            return `<li id="dependent${next_id_number}" class="dependent">
                    #${next_id_number + 1} - Dependent${next_id_number + 1}
                    - Definition: </li>`;
    }
}


// remove variable //
function handleRemoveVarPress(var_type) {
    switch(var_type) {
        case "independent":
            list_id = "independentlist";
            break;
        case "dependent":
            list_id = "dependentlist";
            break;
    }

    // multi-select pattern (findAllSelected implements querySelectAll)
    // findAllSelected(document.getElementById("independentlist")).forEach(independent_selected => {
    //     if (independent_selected !== null) {
    //         independent_selected.remove();
    //     }
    // });

    nearest_variable = null;
        
    if (selected_var[var_type]) {
        nearest_variable = getNearestVariable(selected_var[var_type]);
        selected_var[var_type].remove();
        clearStoredVariableDetails(var_type, selected_var[var_type].id);
    }

    if (nearest_variable != null) {
        nearest_variable.setAttribute("selected", "true");
        selected_var[var_type] = nearest_variable;
        loadStoredVariableDetails(var_type, selected_var[var_type].id);
    }
    else {
        selected_var[var_type] = null;
        hideDetailForm(var_type);
    }

    updateListItemIDs(list_id);
    updatedStoredVariableIDs(var_type);
}


function getNearestVariable(currentVariable, mode='prev') {
    nearest_variable = null;

    if (currentVariable.parentElement.childElementCount > 1) {
        switch(mode) {
            case 'prev': {
                nearest_variable = currentVariable.previousSibling;
                if (nearest_variable) {
                    if (nearest_variable.nodeType !== 1) {
                        nearest_variable = currentVariable.nextSibling;
                    }
                } 
                break;
            }
            case 'next': {
                nearest_variable = currentVariable.nextSibling;
                if (nearest_variable) {
                    if (nearest_variable & nearest_variable.nodeType !== 1) {
                        nearest_variable = currentVariable.previousSibling;
                    }
                }
                break;
            }
        }
    }

    return nearest_variable;  
}


function updateListItemIDs(list_id) {
    new_id_number = 0;
    getListChildren(list_id).forEach(list_item => {
        if (list_item.nodeType == 1) {
            unnumbered_list_id = list_item.getAttribute("id").replace(/[0-9]/g, '');
            list_item.setAttribute("id", unnumbered_list_id + new_id_number);
            updateListItemNumber(list_item, new_id_number + 1);
            new_id_number++;
        }
    });
}


function updateListItemNumber(list_item, new_item_number) {
    list_item.innerHTML = list_item.innerHTML.replace(/#([0-9]+)/g, "#" + new_item_number);
    list_item.innerHTML = list_item.innerHTML.replace(/Independent([0-9]+)/g, "Independent" + new_item_number);
    list_item.innerHTML = list_item.innerHTML.replace(/Dependent([0-9]+)/g, "Dependent" + new_item_number);
}


function clearVariables(var_type) {
    switch(var_type) {
        case "independent":
            list_id = "independentlist";
            break;
        case "dependent":
            list_id = "dependentlist";
            break;
    }

    document.getElementById(var_list_id).innerHTML = "";
}


// VARIABLE DETAIL DATA MANAGEMENT //
function updateStoredVariableDetails(var_type, updated_field_element) {
    var_type_detail_obj = JSON.parse(localStorage.getItem(var_type));
    if (selected_var[var_type].id in var_type_detail_obj) {
        var_detail_obj = var_type_detail_obj[selected_var[var_type].id];
        var_detail_obj[updated_field_element.id] = updated_field_element.value;
    }
    else {
        var_detail_obj = {};
        var_detail_obj[updated_field_element.id] = updated_field_element.value;
    }

    var_type_detail_obj[selected_var[var_type].id] = var_detail_obj;
    localStorage.setItem(var_type, JSON.stringify(var_type_detail_obj));
}


function loadStoredVariableDetails(var_type, var_id) {
    var_type_detail_obj = JSON.parse(localStorage.getItem(var_type));
    if (var_id in var_type_detail_obj) {
        var_detail_obj = var_type_detail_obj[var_id];
        Object.keys(var_detail_obj).forEach(var_detail_id => {
            var_detail_element = document.getElementById(var_detail_id);
            var_detail_element.value = var_detail_obj[var_detail_id];
        });
    }
    else {
        clearDetailForm(var_type);
    }
}


function clearStoredVariableDetails(var_type, var_id=null) {
    if (var_id == null) {
        localStorage.setItem(var_type, JSON.stringify({}));
        return true;
    }

    var_type_detail_obj = JSON.parse(localStorage.getItem(var_type));
    if (var_id in var_type_detail_obj) {
        delete var_type_detail_obj[var_id];
        localStorage.setItem(var_type, JSON.stringify(var_type_detail_obj));
        return true;
    }

    return false;
}


function updatedStoredVariableIDs(var_type) {
    var_type_detail_obj = JSON.parse(localStorage.getItem(var_type));
    last_id_number = Object.keys(var_type_detail_obj).length - 1;

    Object.keys(var_type_detail_obj).forEach((var_id, new_id_number) => {
        new_var_id = var_id.replace(/([0-9]+)/g, new_id_number);
        var_type_detail_obj[new_var_id] = var_type_detail_obj[var_id];
        if (new_id_number == last_id_number) {
            delete var_type_detail_obj[var_id];
        }
    });

    localStorage.setItem(var_type, JSON.stringify(var_type_detail_obj));
}


// DETAIL FORMS AND FIELD MANIPULATION //
function clearDetailForm(form_type) {
    switch(form_type) {
        case "independent":
            form_id = "independentdetails";
            break;
        case "dependent": 
            form_id = "dependentdetails";
            break;
    }
    document.getElementById(form_id).querySelectorAll(".trackedInput").forEach(field => field.value = '');
}


function showDetailForm(var_type) {
    switch(var_type) {
        case "independent":
            independent_details.hidden = false;
            break;
        case "dependent":
            dependent_details.hidden = false;
            break;
    }
}


function hideDetailForm(var_type) {
    switch(var_type) {
        case "independent":
            independent_details.hidden = true;
            break;
        case "dependent":
            dependent_details.hidden = true;
            break;
    }
}


function updateIndependentDetailForm(distribution_type) {
    switch(distribution_type) {
        // general pattern for more distributions:
        // hide all fields
        // only show fields for distribution type
        case "norm":
            document.getElementById("norm_details").hidden = false;
            break;
        case "uni":
            document.getElementById("norm_details").hidden = true;
            break;
    }
}



// DOWNLOAD MANAGEMENT //
function openDownloadPopup(download_type) {
    alert(download_type);
}



// RUN //
document.addEventListener("DOMContentLoaded", () => {
    // initialize local storage
    localStorage.setItem("independent", JSON.stringify({}));
    localStorage.setItem("dependent", JSON.stringify({}));

    // create global vars
    next_dep_id_number = 0;
    next_ind_id_number = 0;
    selected_var = {"independent": null, "dependent": null};

    // grab DOM objects
    add_independent_btn = document.getElementById("add_independent");
    rem_independent_btn = document.getElementById("rem_independent");
    clr_independents_btn = document.getElementById("clr_independents");

    distribution_type_slctn = document.getElementById("independent_distribution");

    add_dependent_btn = document.getElementById("add_dependent");
    rem_dependent_btn = document.getElementById("rem_dependent");
    clr_dependents_btn = document.getElementById("clr_dependents");

    download_btns = document.getElementsByClassName("downloadBtn");

    independent_details = document.getElementById("independentdetails")
    dependent_details = document.getElementById("dependentdetails")
    

    // Variable list manipulation button listeners
    add_independent_btn.addEventListener("click", () => {
        addVariable("independent");
    });


    rem_independent_btn.addEventListener("click", () => {
        handleRemoveVarPress("independent");
    });


    clr_independents_btn.addEventListener("click", () => {
        clearVariables("independent");
        clearStoredVariableDetails("independent");
        hideDetailForm("independent");
    });


    distribution_type_slctn.addEventListener("change", e => {
        updateIndependentDetailForm(e.target.value);
    })


    add_dependent_btn.addEventListener("click", () => {
        addVariable("dependent");
    });


    rem_dependent_btn.addEventListener("click", () => {
        handleRemoveVarPress("dependent");
    });


    clr_dependents_btn.addEventListener("click", () => {
        clearVariables("dependent");
        clearStoredVariableDetails("dependent");
        hideDetailForm("dependent");
    });


    // Setup detail data storage functionality
    independent_details.querySelectorAll(".trackedInput").forEach(tracked_input => {
        tracked_input.addEventListener("change", event => updateStoredVariableDetails("independent", event.target));
    });

    dependent_details.querySelectorAll(".trackedInput").forEach(tracked_input => {
        tracked_input.addEventListener("change", event => updateStoredVariableDetails("dependent", event.target));
    });


    // Download button listeners
    Array.from(download_btns).forEach(download_btn => {
        download_btn.addEventListener("click", () => {
            openDownloadPopup(download_btn.getAttribute("download_type"));
        });
    });

});