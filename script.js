/* =========================================
   CAMPUS SHUTTLE
   COMPLETE JAVASCRIPT
========================================= */


/* =========================================
   GOOGLE SHEETS
========================================= */

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxJKKH1HgxDx50u6aPSnxpYjIZUcPIxeGDjzMy2buc30h59WNKD8Xlvv2XcKLbW5w/exec";


/* =========================================
   TRAVEL TIME
========================================= */

const TRAVEL_TIME_MINUTES = 10;


/* =========================================
   WEEKDAY SCHEDULE
========================================= */

/*
    First time  = Campus departure
    Second time = Sarjapur departure
*/

const weekdaySchedule = [

    ["07:00", "07:15"],
    ["07:20", "07:30"],
    ["07:35", "07:45"],
    ["07:50", "08:00"],
    ["08:05", "08:15"],
    ["08:20", "08:30"],
    ["08:35", "08:45"],
    ["08:50", "09:00"],
    ["09:05", "09:35"],
    ["09:40", "10:00"],
    ["10:20", "10:30"],
    ["11:30", "11:45"],

    /* EXTRA SARJAPUR → CAMPUS */
    ["13:15", null],

    ["14:00", "14:15"],
    ["14:45", "15:00"],
    ["16:00", "16:15"],
    ["16:30", "16:35"],
    ["17:00", "17:05"],
    ["17:15", "17:20"],
    ["17:30", "17:35"],
    ["17:45", "17:50"],
    ["18:00", "18:05"],
    ["18:15", "18:35"],
    ["18:40", "18:45"],
    ["19:00", "19:05"],
    ["19:30", "19:45"],
    ["20:00", "20:10"],
    ["20:30", "20:40"],
    ["21:00", "21:15"],
    ["21:30", "21:45"],
    ["22:00", "22:10"]

];


/* =========================================
   WEEKEND SCHEDULE
========================================= */

const weekendSchedule = [

    ["07:20", "07:30"],
    ["07:45", "08:00"],
    ["08:20", "08:30"],
    ["08:50", "09:00"],
    ["09:10", "10:00"],
    ["11:45", "12:00"],
    ["13:45", "14:15"],
    ["14:45", "15:00"],
    ["16:00", "16:15"],
    ["17:00", "17:15"],
    ["17:45", "18:15"],
    ["18:45", "19:00"],
    ["19:45", "20:00"],
    ["20:45", "21:00"],
    ["22:00", "22:05"]

];


/* =========================================
   DOM ELEMENTS
========================================= */

const locationSelect =
    document.getElementById("location");

const liveStatus =
    document.getElementById("liveStatus");

const startStop =
    document.getElementById("startStop");

const endStop =
    document.getElementById("endStop");

const busState =
    document.getElementById("busState");

const departureTime =
    document.getElementById("departureTime");

const liveArrivalTime =
    document.getElementById("liveArrivalTime");

const timeRemaining =
    document.getElementById("timeRemaining");

const liveMessage =
    document.getElementById("liveMessage");

const routeProgress =
    document.getElementById("routeProgress");

const busMarker =
    document.getElementById("busMarker");

const upcomingList =
    document.getElementById("upcomingList");

const dayType =
    document.getElementById("dayType");


/* =========================================
   TIME FUNCTIONS
========================================= */

function timeToMinutes(time) {

    if (!time) {
        return null;
    }

    const parts =
        time.split(":");

    return (
        parseInt(parts[0]) * 60 +
        parseInt(parts[1])
    );
}


function minutesToTime(minutes) {

    minutes =
        minutes % 1440;

    if (minutes < 0) {
        minutes += 1440;
    }

    let hours =
        Math.floor(minutes / 60);

    let mins =
        minutes % 60;

    const suffix =
        hours >= 12
            ? "PM"
            : "AM";

    hours =
        hours % 12;

    if (hours === 0) {
        hours = 12;
    }

    return (
        String(hours) +
        ":" +
        String(mins).padStart(2, "0") +
        " " +
        suffix
    );
}


function getCurrentMinutes() {

    const now =
        new Date();

    return (
        now.getHours() * 60 +
        now.getMinutes()
    );
}


function getCurrentSeconds() {

    const now =
        new Date();

    return (
        now.getSeconds()
    );
}


/* =========================================
   GET TODAY'S SCHEDULE
========================================= */

function getTodaySchedule() {

    const day =
        new Date().getDay();

    /*
        0 = Sunday
        6 = Saturday
    */

    if (
        day === 0 ||
        day === 6
    ) {
        return weekendSchedule;
    }

    return weekdaySchedule;
}


function isWeekend() {

    const day =
        new Date().getDay();

    return (
        day === 0 ||
        day === 6
    );
}


/* =========================================
   DETERMINE ROUTE
========================================= */

function getSelectedLocation() {

    if (!locationSelect) {
        return "sarjapur-police-station";
    }

    return locationSelect.value;
}


function getRouteName(direction) {

    if (direction === "outbound") {

        return "Campus → Sarjapur";

    }

    return "Sarjapur → Campus";
}


/* =========================================
   BUILD ALL TRIPS
========================================= */

function getAllTrips() {

    const schedule =
        getTodaySchedule();

    const trips = [];


    schedule.forEach((row) => {

        const campusDeparture =
            row[0];

        const sarjapurDeparture =
            row[1];


        if (campusDeparture) {

            const departure =
                timeToMinutes(
                    campusDeparture
                );

            trips.push({

                direction:
                    "outbound",

                departure:
                    departure,

                arrival:
                    departure +
                    TRAVEL_TIME_MINUTES,

                departureText:
                    campusDeparture

            });

        }


        if (sarjapurDeparture) {

            const departure =
                timeToMinutes(
                    sarjapurDeparture
                );

            trips.push({

                direction:
                    "return",

                departure:
                    departure,

                arrival:
                    departure +
                    TRAVEL_TIME_MINUTES,

                departureText:
                    sarjapurDeparture

            });

        }

    });


    /*
        Extra 1:15 PM Sarjapur → Campus
    */

    trips.push({

        direction:
            "return",

        departure:
            timeToMinutes("13:15"),

        arrival:
            timeToMinutes("13:15") +
            TRAVEL_TIME_MINUTES,

        departureText:
            "13:15"

    });


    trips.sort(
        (a, b) =>
            a.departure -
            b.departure
    );


    return trips;
}


/* =========================================
   GET NEXT TRIP
========================================= */

function getNextTrip() {

    const now =
        getCurrentMinutes();

    const trips =
        getAllTrips();


    return trips.find(
        trip =>
            trip.departure >= now
    );
}


/* =========================================
   GET CURRENT RUNNING TRIP
========================================= */

function getCurrentTrip() {

    const now =
        getCurrentMinutes();

    const trips =
        getAllTrips();


    return trips.find(
        trip =>
            now >= trip.departure &&
            now <
            trip.arrival
    );
}


/* =========================================
   FORMAT DURATION
========================================= */

function formatDuration(minutes) {

    if (minutes <= 0) {
        return "Now";
    }

    if (minutes === 1) {
        return "1 min";
    }

    return (
        Math.floor(minutes) +
        " min"
    );
}


/* =========================================
   UPDATE ROUTE DISPLAY
========================================= */

function updateRouteDisplay(
    direction
) {

    if (!startStop || !endStop) {
        return;
    }


    if (
        direction ===
        "outbound"
    ) {

        startStop.innerText =
            "Campus";

        endStop.innerText =
            "Sarjapur Police Station";

    } else {

        startStop.innerText =
            "Sarjapur Police Station";

        endStop.innerText =
            "Campus";

    }

}


/* =========================================
   LIVE SHUTTLE TRACKER
========================================= */

function updateLiveTracker() {

    if (!liveStatus) {
        return;
    }


    const now =
        getCurrentMinutes();


    const seconds =
        getCurrentSeconds();


    const currentTrip =
        getCurrentTrip();


    const nextTrip =
        getNextTrip();


    /* =====================================
       BUS CURRENTLY RUNNING
    ====================================== */

    if (currentTrip) {

        const elapsed =
            (
                now -
                currentTrip.departure
            ) +
            seconds / 60;


        const duration =
            TRAVEL_TIME_MINUTES;


        let progress =
            (
                elapsed /
                duration
            ) * 100;


        progress =
            Math.max(
                0,
                Math.min(
                    100,
                    progress
                )
            );


        updateRouteDisplay(
            currentTrip.direction
        );


        liveStatus.innerText =
            "Shuttle is running";


        busState.innerText =
            "RUNNING";


        departureTime.innerText =
            minutesToTime(
                currentTrip.departure
            );


        liveArrivalTime.innerText =
            minutesToTime(
                currentTrip.arrival
            );


        const remaining =
            Math.max(
                0,
                currentTrip.arrival -
                now
            );


        timeRemaining.innerText =
            formatDuration(
                remaining
            );


        routeProgress.style.width =
            progress + "%";


        busMarker.style.left =
            progress + "%";


        liveMessage.innerText =
            "🚌 Shuttle is currently travelling";


        return;

    }


    /* =====================================
       NEXT SHUTTLE
    ====================================== */

    if (nextTrip) {

        updateRouteDisplay(
            nextTrip.direction
        );


        liveStatus.innerText =
            "Next shuttle";


        busState.innerText =
            "SCHEDULED";


        departureTime.innerText =
            minutesToTime(
                nextTrip.departure
            );


        liveArrivalTime.innerText =
            minutesToTime(
                nextTrip.arrival
            );


        const remaining =
            nextTrip.departure -
            now;


        timeRemaining.innerText =
            formatDuration(
                remaining
            );


        routeProgress.style.width =
            "0%";


        busMarker.style.left =
            "0%";


        liveMessage.innerText =
            "Next shuttle departs in " +
            formatDuration(
                remaining
            );


        return;

    }


    /* =====================================
       NO MORE SHUTTLES
    ====================================== */

    liveStatus.innerText =
        "Service completed";


    busState.innerText =
        "NO SERVICE";


    departureTime.innerText =
        "--";


    liveArrivalTime.innerText =
        "--";


    timeRemaining.innerText =
        "--";


    routeProgress.style.width =
        "0%";


    busMarker.style.left =
        "0%";


    liveMessage.innerText =
        "No more scheduled shuttles today.";

}


/* =========================================
   UPCOMING SHUTTLES
========================================= */

function updateUpcomingShuttles() {

    if (!upcomingList) {
        return;
    }


    const now =
        getCurrentMinutes();


    const trips =
        getAllTrips();


    const upcoming =
        trips
            .filter(
                trip =>
                    trip.departure >
                    now
            )
            .slice(0, 6);


    upcomingList.innerHTML =
        "";


    if (
        upcoming.length === 0
    ) {

        upcomingList.innerHTML = `

            <div class="shuttle-card">

                <div class="shuttle-card-left">

                    <div>
                        <div class="shuttle-time">
                            No more shuttles
                        </div>

                        <div class="shuttle-route">
                            Service completed for today
                        </div>
                    </div>

                </div>

            </div>

        `;

        return;

    }


    upcoming.forEach(
        trip => {

            const route =
                getRouteName(
                    trip.direction
                );


            upcomingList.innerHTML += `

                <div class="shuttle-card">

                    <div class="shuttle-card-left">

                        <div>

                            <div class="shuttle-time">
                                ${minutesToTime(
                                    trip.departure
                                )}
                            </div>

                            <div class="shuttle-route">
                                ${route}
                            </div>

                        </div>

                    </div>


                    <div class="shuttle-arrival">

                        Arrives approximately

                        <strong>
                            ${minutesToTime(
                                trip.arrival
                            )}
                        </strong>

                    </div>

                </div>

            `;

        }
    );

}


/* =========================================
   DAY TYPE
========================================= */

function updateDayType() {

    if (!dayType) {
        return;
    }


    dayType.innerText =
        isWeekend()
            ? "Weekend / Holiday"
            : "Weekday";

}


/* =========================================
   TRAFFIC REPORT
========================================= */

const TRAFFIC_EXPIRY_MINUTES =
    15;


async function reportTraffic() {

    const button =
        document.getElementById(
            "trafficButton"
        );


    const status =
        document.getElementById(
            "trafficStatus"
        );


    if (!button || !status) {
        return;
    }


    if (
        !GOOGLE_SCRIPT_URL ||
        GOOGLE_SCRIPT_URL.includes(
            "PASTE_YOUR"
        )
    ) {

        status.innerText =
            "Google Sheets is not connected yet.";

        return;

    }


    button.disabled =
        true;


    button.innerText =
        "Sending report...";


    const currentTrip =
        getCurrentTrip();


    const nextTrip =
        getNextTrip();


    let route =
        "Campus → Sarjapur";


    if (currentTrip) {

        route =
            getRouteName(
                currentTrip.direction
            );

    } else if (nextTrip) {

        route =
            getRouteName(
                nextTrip.direction
            );

    }


    try {

        await fetch(
            GOOGLE_SCRIPT_URL,
            {

                method: "POST",

                mode: "no-cors",

                body:
                    JSON.stringify({

                        route:
                            route,

                        status:
                            "TRAFFIC"

                    })

            }
        );


        button.innerText =
            "✓ Traffic Reported";


        status.classList.add(
            "active"
        );


        status.innerText =
            "🚦 Traffic reported • Thank you";


        checkTrafficReports();


        setTimeout(
            () => {

                button.disabled =
                    false;

                button.innerText =
                    "🚦 Report Traffic";

            },
            30000
        );


    } catch (error) {

        console.error(
            "Traffic report error:",
            error
        );


        button.disabled =
            false;


        button.innerText =
            "🚦 Report Traffic";


        status.innerText =
            "Unable to send report.";

    }

}


/* =========================================
   CHECK TRAFFIC REPORTS
========================================= */

async function checkTrafficReports() {

    const status =
        document.getElementById(
            "trafficStatus"
        );


    if (!status) {
        return;
    }


    if (
        !GOOGLE_SCRIPT_URL ||
        GOOGLE_SCRIPT_URL.includes(
            "PASTE_YOUR"
        )
    ) {

        status.innerText =
            "Traffic reporting available after setup.";

        return;

    }


    try {

        const response =
            await fetch(
                GOOGLE_SCRIPT_URL
            );


        const data =
            await response.json();


        if (
            !data.success ||
            !data.reports
        ) {

            return;

        }


        const now =
            Date.now();


        const recentReports =
            data.reports.filter(
                report => {

                    const reportTime =
                        new Date(
                            report.timestamp
                        ).getTime();


                    const age =
                        (
                            now -
                            reportTime
                        ) / 60000;


                    return (

                        age >= 0 &&

                        age <=
                        TRAFFIC_EXPIRY_MINUTES &&

                        report.status ===
                        "TRAFFIC"

                    );

                }
            );


        if (
            recentReports.length > 0
        ) {

            const latest =
                recentReports[
                    recentReports.length - 1
                ];


            showTrafficWarning(
                latest
            );

        } else {

            clearTrafficWarning();

        }


    } catch (error) {

        console.error(
            "Traffic check error:",
            error
        );

    }

}


/* =========================================
   SHOW TRAFFIC WARNING
========================================= */

function showTrafficWarning(
    report
) {

    const status =
        document.getElementById(
            "trafficStatus"
        );


    if (!status) {
        return;
    }


    status.classList.add(
        "active"
    );


    status.classList.remove(
        "clear"
    );


    const reportTime =
        new Date(
            report.timestamp
        );


    const minutesAgo =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now() -
                    reportTime.getTime()
                ) / 60000
            )
        );


    const timeText =
        minutesAgo === 0
            ? "just now"
            : `${minutesAgo} min ago`;


    status.innerHTML = `

        🚦 <strong>
            Shuttle in traffic
        </strong>

        <br>

        ${report.route}

        • Reported ${timeText}

    `;


    if (busState) {

        busState.innerText =
            "IN TRAFFIC";

    }


    if (liveMessage) {

        liveMessage.innerText =
            "🚦 Traffic reported by a passenger";

    }

}


/* =========================================
   CLEAR TRAFFIC
========================================= */

function clearTrafficWarning() {

    const status =
        document.getElementById(
            "trafficStatus"
        );


    if (!status) {
        return;
    }


    status.classList.remove(
        "active"
    );


    status.classList.add(
        "clear"
    );


    status.innerText =
        "🟢 No recent traffic report";

}


/* =========================================
   LOCATION CHANGE
========================================= */

if (locationSelect) {

    locationSelect.addEventListener(
        "change",
        () => {

            updateLiveTracker();

            updateUpcomingShuttles();

        }
    );

}


/* =========================================
   UPDATE EVERYTHING
========================================= */

function updateWebsite() {

    updateLiveTracker();

    updateUpcomingShuttles();

    updateDayType();

}


/* =========================================
   START WEBSITE
========================================= */

updateWebsite();

checkTrafficReports();


/* Update every second */

setInterval(
    updateWebsite,
    1000
);


/* Check Google Sheet every 30 seconds */

setInterval(
    checkTrafficReports,
    30000
);
/* =========================================
   INSTALL CAMPUS SHUTTLE APP
========================================= */

let deferredInstallPrompt = null;

const installAppButton =
    document.getElementById("installAppButton");


/* Chrome / Android installation */

window.addEventListener(
    "beforeinstallprompt",
    (event) => {

        event.preventDefault();

        deferredInstallPrompt = event;

        console.log("Campus Shuttle can be installed.");
    }
);


/* Install button */

if (installAppButton) {

    installAppButton.addEventListener(
        "click",
        async () => {

            /* Android / Chrome */

            if (deferredInstallPrompt) {

                deferredInstallPrompt.prompt();

                const choice =
                    await deferredInstallPrompt.userChoice;

                console.log(
                    "Install choice:",
                    choice.outcome
                );

                deferredInstallPrompt = null;

                return;
            }


            /* iPhone / Safari */

            const isIOS =
                /iphone|ipad|ipod/i.test(
                    navigator.userAgent
                );

            if (isIOS) {

                alert(
                    "To install Campus Shuttle:\n\n" +
                    "1. Tap the Share button in Safari.\n" +
                    "2. Select 'Add to Home Screen'.\n" +
                    "3. Tap 'Add'."
                );

                return;
            }


            /* If browser has not provided install prompt */

            alert(
                "To install Campus Shuttle:\n\n" +
                "Open your browser menu and choose " +
                "'Install Campus Shuttle' or " +
                "'Add to Home screen'."
            );
        }
    );
}


/* Detect successful installation */

window.addEventListener(
    "appinstalled",
    () => {

        console.log(
            "Campus Shuttle installed."
        );

        if (installAppButton) {
            installAppButton.style.display = "none";
        }
    }
);