// =========================================
// GOOGLE SHEETS TRAFFIC REPORTING
// =========================================

const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbxJKKH1HgxDx50u6aPSnxpYjIZUcPIxeGDjzMy2buc30h59WNKD8Xlvv2XcKLbW5w/exec";
// =========================================
// CAMPUS SHUTTLE DATA
// =========================================


// Monday - Friday

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


// Saturday / Sunday / Holidays

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


// =========================================
// HTML ELEMENTS
// =========================================

const pickupTimeElement =
    document.getElementById("pickupTime");

const campusTimeElement =
    document.getElementById("campusTime");

const countdownElement =
    document.getElementById("countdown");

const upcomingListElement =
    document.getElementById("upcomingList");

const currentDateElement =
    document.getElementById("currentDate");

const dayTypeElement =
    document.getElementById("dayType");

const serviceStatusElement =
    document.getElementById("serviceStatus");


// Live tracker elements

const liveStatus =
    document.getElementById("liveStatus");

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

const startStop =
    document.getElementById("startStop");

const endStop =
    document.getElementById("endStop");


// =========================================
// TIME FUNCTIONS
// =========================================

function timeToMinutes(time) {

    const parts =
        time.split(":");

    return (
        Number(parts[0]) * 60 +
        Number(parts[1])
    );

}


function formatTime(time) {

    const parts =
        time.split(":");

    let hours =
        Number(parts[0]);

    const minutes =
        parts[1];

    const period =
        hours >= 12 ? "PM" : "AM";

    hours =
        hours % 12;

    if (hours === 0) {

        hours = 12;

    }

    return `${hours}:${minutes} ${period}`;

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
        now.getHours() * 3600 +
        now.getMinutes() * 60 +
        now.getSeconds()
    );

}


// =========================================
// TODAY'S SCHEDULE
// =========================================

function getTodaySchedule() {

    const day =
        new Date().getDay();


    if (
        day === 0 ||
        day === 6
    ) {

        return weekendSchedule;

    }


    return weekdaySchedule;

}


// =========================================
// NEXT SHUTTLE
// =========================================

function getNextShuttle(schedule) {

    const now =
        getCurrentMinutes();


    for (
        let i = 0;
        i < schedule.length;
        i++
    ) {

        const departure =
            timeToMinutes(
                schedule[i][0]
            );


        if (
            departure >= now
        ) {

            return {
                shuttle: schedule[i],
                index: i
            };

        }

    }


    return null;

}


// =========================================
// DISPLAY DATE
// =========================================

function displayDate() {

    const now =
        new Date();


    const options = {

        weekday: "long",

        day: "numeric",

        month: "long",

        year: "numeric"

    };


    if (currentDateElement) {

        currentDateElement.textContent =
            now.toLocaleDateString(
                "en-IN",
                options
            );

    }

}


// =========================================
// DAY TYPE
// =========================================

function displayDayType() {

    const day =
        new Date().getDay();


    if (!dayTypeElement) {
        return;
    }


    if (
        day === 0 ||
        day === 6
    ) {

        dayTypeElement.textContent =
            "Weekend / Holiday";

    } else {

        dayTypeElement.textContent =
            "Monday – Friday";

    }

}


// =========================================
// NEXT SHUTTLE
// =========================================

function displayNextShuttle() {

    const schedule =
        getTodaySchedule();


    if (
        !pickupTimeElement ||
        !campusTimeElement
    ) {

        return;

    }


    const next =
        getNextShuttle(schedule);


    if (!next) {

        pickupTimeElement.textContent =
            "No more";

        campusTimeElement.textContent =
            "Today";


        if (countdownElement) {

            countdownElement.textContent =
                "No more shuttles today.";

        }


        if (serviceStatusElement) {

            serviceStatusElement.textContent =
                "Service finished for today";

        }


        if (upcomingListElement) {

            upcomingListElement.innerHTML =
                "<p>No more shuttles today.</p>";

        }


        return;

    }


    const pickup =
        next.shuttle[0];

    const arrival =
        next.shuttle[1];


    pickupTimeElement.textContent =
        formatTime(pickup);

    campusTimeElement.textContent =
        formatTime(arrival);


    const current =
        getCurrentMinutes();

    const difference =
        timeToMinutes(pickup) -
        current;


    if (difference <= 0) {

        countdownElement.textContent =
            "🚌 Shuttle is leaving now";

    }

    else if (difference === 1) {

        countdownElement.textContent =
            "Leaves in 1 minute";

    }

    else {

        countdownElement.textContent =
            `Leaves in ${difference} minutes`;

    }


    serviceStatusElement.textContent =
        "Next available shuttle";


    displayUpcomingShuttles(
        schedule,
        next.index
    );

}


// =========================================
// UPCOMING SHUTTLES
// =========================================

function displayUpcomingShuttles(
    schedule,
    index
) {

    if (!upcomingListElement) {
        return;
    }


    upcomingListElement.innerHTML =
        "";


    const upcoming =
        schedule.slice(
            index,
            index + 5
        );


    upcoming.forEach(
        (shuttle, i) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "shuttle-row";


            row.innerHTML = `

                <div>

                    <div class="shuttle-time">
                        ${formatTime(shuttle[0])}
                    </div>

                    <span class="shuttle-label">
                        Pickup
                    </span>

                </div>


                <div class="shuttle-arrow">
                    →
                </div>


                <div>

                    <div class="shuttle-time">
                        ${formatTime(shuttle[1])}
                    </div>

                    <span class="shuttle-label">
                        Campus
                    </span>

                </div>


                ${
                    i === 0
                    ?
                    `<div class="next-badge">
                        NEXT
                    </div>`
                    :
                    `<div></div>`
                }

            `;


            upcomingListElement.appendChild(
                row
            );

        }
    );

}


// =========================================
// LIVE SHUTTLE TRACKER
// =========================================

function updateLiveTracker() {

    if (!liveStatus) {
        return;
    }


    const schedule =
        getTodaySchedule();


    const nowSeconds =
        getCurrentSeconds();


    const nowMinutes =
        nowSeconds / 60;


    let activeTrip = null;

    let activeDirection = null;


    /*
        Each timetable row has:

        Campus → Police
        Police → Campus
    */


    for (
        let i = 0;
        i < schedule.length;
        i++
    ) {

        const outboundStart =
            timeToMinutes(
                schedule[i][0]
            );

        const outboundEnd =
            timeToMinutes(
                schedule[i][1]
            );


        /*
            Campus → Police
        */

        if (
            nowMinutes >= outboundStart &&
            nowMinutes < outboundEnd
        ) {

            activeTrip = {

                start: outboundStart,

                end: outboundEnd,

                direction: "outbound"

            };

            break;

        }


        /*
            Police → Campus
        */

        if (
            nowMinutes >= outboundEnd &&
            i + 1 < schedule.length
        ) {

            /*
                Return trip is considered
                to begin at the listed
                return time and end at the
                next scheduled outbound
                only when the next trip
                gives us the next return.

                For visual purposes we use
                the same timetable pair.
            */

        }

    }


    /*
        Find a return trip from the
        current schedule row.
    */

    if (!activeTrip) {

        for (
            let i = 0;
            i < schedule.length;
            i++
        ) {

            const returnStart =
                timeToMinutes(
                    schedule[i][1]
                );


            const returnEnd =
                timeToMinutes(
                    schedule[i][0]
                );


            /*
                Since the return arrival is
                listed as the next value in
                the timetable pairing,
                use a practical journey duration
                based on that row.

                For the reverse trip we use
                the same duration.
            */

            const outboundStart =
                timeToMinutes(
                    schedule[i][0]
                );

            const outboundEnd =
                timeToMinutes(
                    schedule[i][1]
                );


            const duration =
                outboundEnd -
                outboundStart;


            const estimatedReturnEnd =
                returnStart +
                duration;


            if (
                nowMinutes >= returnStart &&
                nowMinutes < estimatedReturnEnd
            ) {

                activeTrip = {

                    start: returnStart,

                    end: estimatedReturnEnd,

                    direction: "return"

                };

                break;

            }

        }

    }


    /*
        ACTIVE TRIP
    */

    if (activeTrip) {

        const elapsed =
            nowMinutes -
            activeTrip.start;


        const duration =
            activeTrip.end -
            activeTrip.start;


        let progress =
            elapsed / duration;


        progress =
            Math.max(
                0,
                Math.min(
                    1,
                    progress
                )
            );


        /*
            Reverse animation for
            Police → Campus.
        */

        if (
            activeTrip.direction ===
            "return"
        ) {

            progress =
                1 - progress;

            startStop.textContent =
                "Sarjapur Police Station";

            endStop.textContent =
                "Campus";

        }

        else {

            startStop.textContent =
                "Campus";

            endStop.textContent =
                "Sarjapur Police Station";

        }


        const percentage =
            progress * 100;


        routeProgress.style.width =
            `${percentage}%`;


        busMarker.style.left =
            `${percentage}%`;


        liveStatus.textContent =
            activeTrip.direction ===
            "return"
            ?
            "Shuttle is running to Campus"
            :
            "Shuttle is running";


        busState.textContent =
            "🟢 Running";


        departureTime.textContent =
            formatMinutes(
                activeTrip.start
            );


        liveArrivalTime.textContent =
            formatMinutes(
                activeTrip.end
            );


        const remaining =
            Math.max(
                0,
                Math.ceil(
                    activeTrip.end -
                    nowMinutes
                )
            );


        timeRemaining.textContent =
            formatDuration(
                remaining
            );


        liveMessage.textContent =
            activeTrip.direction ===
            "return"
            ?
            "🚌 Shuttle is on its way to Campus."
            :
            "🚌 Shuttle is travelling towards Sarjapur Police Station.";


        return;

    }


    /*
        NO ACTIVE BUS
    */

    const next =
        getNextScheduledTrip(
            schedule,
            nowMinutes
        );


    if (next) {

        liveStatus.textContent =
            "Next shuttle is waiting";


        busState.textContent =
            "⏳ Waiting";


        departureTime.textContent =
            formatMinutes(
                next.start
            );


        liveArrivalTime.textContent =
            formatMinutes(
                next.end
            );


        const wait =
            Math.max(
                0,
                Math.ceil(
                    next.start -
                    nowMinutes
                )
            );


        timeRemaining.textContent =
            formatDuration(
                wait
            );


        liveMessage.textContent =
            `Next shuttle departs in ${formatDuration(wait)}.`;


        routeProgress.style.width =
            "0%";


        busMarker.style.left =
            "0%";


        startStop.textContent =
            "Campus";

        endStop.textContent =
            "Sarjapur Police Station";


        return;

    }


    /*
        DAY FINISHED
    */

    liveStatus.textContent =
        "Shuttle service finished";


    busState.textContent =
        "🛑 Stopped";


    departureTime.textContent =
        "--";


    liveArrivalTime.textContent =
        "--";


    timeRemaining.textContent =
        "--";


    liveMessage.textContent =
        "No more scheduled shuttles today.";


    routeProgress.style.width =
        "0%";


    busMarker.style.left =
        "0%";

}


// =========================================
// FIND NEXT SCHEDULED TRIP
// =========================================

function getNextScheduledTrip(
    schedule,
    currentTime
) {

    for (
        let i = 0;
        i < schedule.length;
        i++
    ) {

        const start =
            timeToMinutes(
                schedule[i][0]
            );


        if (
            start > currentTime
        ) {

            return {

                start: start,

                end:
                    timeToMinutes(
                        schedule[i][1]
                    )

            };

        }

    }


    return null;

}


// =========================================
// FORMAT MINUTES
// =========================================

function formatMinutes(
    minutes
) {

    const hours =
        Math.floor(
            minutes / 60
        );

    const mins =
        Math.floor(
            minutes % 60
        );


    const time =
        `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;


    return formatTime(time);

}


// =========================================
// FORMAT DURATION
// =========================================

function formatDuration(
    minutes
) {

    if (minutes < 1) {

        return "Now";

    }


    const hours =
        Math.floor(
            minutes / 60
        );


    const mins =
        minutes % 60;


    if (hours > 0) {

        return `${hours}h ${mins}m`;

    }


    return `${mins} min`;

}


// =========================================
// INITIALIZE
// =========================================

function updateWebsite() {

    displayDate();

    displayDayType();

    displayNextShuttle();

    updateLiveTracker();

}


updateWebsite();


// Update every second

setInterval(
    updateWebsite,
    1000
);
// =========================================
// TRAFFIC REPORT SYSTEM
// =========================================

const TRAFFIC_EXPIRY_MINUTES = 15;


// -----------------------------------------
// REPORT TRAFFIC
// -----------------------------------------

async function reportTraffic() {

    const button =
        document.getElementById("trafficButton");

    const status =
        document.getElementById("trafficStatus");


    button.disabled = true;

    button.innerText =
        "Sending report...";


    // Determine route
    const route =
        getCurrentRoute();


    try {

        await fetch(
            GOOGLE_SCRIPT_URL,
            {
                method: "POST",

                body: JSON.stringify({
                    route: route,
                    status: "TRAFFIC"
                })
            }
        );


        button.innerText =
            "✓ Traffic Reported";

        status.classList.add("active");

        status.innerText =
            "🚦 Traffic reported • Thank you";


        // Immediately refresh
        checkTrafficReports();


        // Enable again after 30 seconds
        setTimeout(() => {

            button.disabled = false;

            button.innerText =
                "🚦 Report Traffic";

        }, 30000);


    } catch (error) {

        console.error(
            "Traffic report error:",
            error
        );

        button.disabled = false;

        button.innerText =
            "🚦 Report Traffic";

        status.innerText =
            "Unable to send report. Try again.";

    }

}


// -----------------------------------------
// DETERMINE CURRENT ROUTE
// -----------------------------------------

function getCurrentRoute() {

    const now =
        getCurrentMinutes();

    const schedule =
        getTodaySchedule();


    if (!schedule || schedule.length === 0) {

        return "Campus → Sarjapur";

    }


    const next =
        getNextShuttle(schedule);


    if (!next) {

        return "Campus → Sarjapur";

    }


    return "Campus → Sarjapur";

}


// -----------------------------------------
// CHECK TRAFFIC REPORTS
// -----------------------------------------

async function checkTrafficReports() {

    const status =
        document.getElementById(
            "trafficStatus"
        );


    if (!status) return;


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


        // Find recent traffic reports
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


// -----------------------------------------
// SHOW TRAFFIC
// -----------------------------------------

function showTrafficWarning(report) {

    const status =
        document.getElementById(
            "trafficStatus"
        );


    if (!status) return;


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


    let timeText =
        minutesAgo === 0
            ? "just now"
            : `${minutesAgo} min ago`;


    status.innerHTML =
        `🚦 <strong>Shuttle in traffic</strong>
        <br>
        ${report.route}
        • Reported ${timeText}`;


    // Update main live message
    const liveMessage =
        document.getElementById(
            "liveMessage"
        );


    if (liveMessage) {

        liveMessage.innerText =
            "🚦 Traffic reported by a passenger";

    }


    // Update bus state
    const busState =
        document.getElementById(
            "busState"
        );


    if (busState) {

        busState.innerText =
            "IN TRAFFIC";

    }

}


// -----------------------------------------
// CLEAR TRAFFIC
// -----------------------------------------

function clearTrafficWarning() {

    const status =
        document.getElementById(
            "trafficStatus"
        );


    if (!status) return;


    status.classList.remove(
        "active"
    );


    status.classList.add(
        "clear"
    );


    status.innerText =
        "🟢 No recent traffic report";


    const liveMessage =
        document.getElementById(
            "liveMessage"
        );


    if (liveMessage) {

        liveMessage.innerText =
            "Shuttle running according to schedule";

    }

}

// -----------------------------------------
// CHECK EVERY 30 SECONDS
// -----------------------------------------

setInterval(
    checkTrafficReports,
    30000
);


// Initial check
checkTrafficReports();