import * as assert from "assert";
import { AnalyticsEvent } from "../../common/api/analyticsEvent";
import { Configuration } from "../../common/impl/configuration";
suite('Test configurations', () => {

    const all = {
        "enabled": "all",
        "includes": [
            {
                "name": "*"
            }
        ]
    };

    const identify = {
        "enabled": "all",
        "includes": [
            {
                "name": "identify"
            }
        ]
    };

    const off = {
        "enabled": "off",
        "includes": [
            {
                "name": "*"
            }
        ]
    };

    const errors = {
        "enabled": "error",
        "excludes": [
            {
                "property": "error",
                "value": "*stackoverflow*"
            }
        ]
    }

    const ratioed = {
        "ratio":"0.3"
    };


    test('Should allow all events', async () => {
        const config = new Configuration(all);
        let event = { event: "something" } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true);
    });

    test('Should not allow any events', async () => {
        const config = new Configuration(off);
        let event = { event: "something" } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false);
    });

    test('Should filter events by name', async () => {
        const config = new Configuration(identify);
        let event = {
            event: "identify"
         } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true);
        event = {
            event: "startup"
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false);
    });

    test('Should only allow errors', async () => {
        const config = new Configuration(errors);
        let event = {
            event: "startup"
         } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} shouldn't be sent`);
        event = {
            event: "failed-analysis",
            properties: {
                "error": "Ohoh, an error occurred!"
            }
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true, `${event.event} should be sent`);
        event = {
            event: "crash-analysis",
            properties: {
                "error": "Bla bla stackoverflow bla"
            }
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} shouldn't be sent`);
    });

    test('Should only allow errors', async () => {
        const config = new Configuration(errors);
        let event = {
            event: "startup"
         } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} shouldn't be sent`);
        event = {
            event: "failed-analysis",
            properties: {
                "error": "Ohoh, an error occurred!"
            }
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true, `${event.event} should be sent`);
        event = {
            event: "crash-analysis",
            properties: {
                "error": "Bla bla stackoverflow bla"
            }
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} shouldn't be sent`);
    });


    test('Should apply ratio on userId', async () => {
        /*
        d0b7ac12-caa0-4253-8087-788ff0b1c293 hashcode:-1654400659 numvalue:0.59
        8668869d-a068-412b-9e59-4fec9dc0483a hashcode:-1782924593 numvalue:0.93
        8b7fe10d-bb9d-434c-afed-4fb03f3b626e hashcode:1373002981 numvalue:0.81
        533629ec-091b-474b-95e6-3aa0eef3e940 hashcode:-69430422 numvalue:0.22
        ceef2ce6-72e1-4ebf-9493-8df2d84b3eb9 hashcode:-1217376767 numvalue:0.67
        21b888d6-8f85-46a7-b6e6-02eee2acc9e8 hashcode:-1078388279 numvalue:0.79
        46d2c605-d94b-4136-9420-0c5adc205e8f hashcode:-1747529146 numvalue:0.46
        29c02d6c-6708-4166-a38c-d219c87bd824 hashcode:1917228150 numvalue:0.5
        aa7565e7-e032-4f94-b7c1-830046286bb3 hashcode:1447488847 numvalue:0.47
        cd304b68-3512-4af5-8991-377479bfede6 hashcode:-449137339 numvalue:0.39
        */

        const config = new Configuration(ratioed);
        let event = {
            userId: "d0b7ac12-caa0-4253-8087-788ff0b1c293", //numvalue:0.59 > 0.3
            event: "startup"
         } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} shouldn't be sent`);
        event = {
            userId: "533629ec-091b-474b-95e6-3aa0eef3e940",//numvalue:0.22 < 0.3
            event: "startup",
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true, `${event.event} should be sent`);
        event = {
            userId: "cd304b68-3512-4af5-8991-377479bfede6",//numvalue:0.39 > 0.3
            event: "startup",
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} shouldn't be sent`);
    });
});