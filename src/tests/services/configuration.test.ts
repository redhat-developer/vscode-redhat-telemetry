import * as assert from "assert";
import { AnalyticsEvent } from "../../common/api/analyticsEvent";
import { Configuration } from "../../common/impl/configuration";
import { generateUUID } from "../../common/utils/uuid";
import { hashCode, numValue } from "../../common/utils/hashcode";
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

    const ratioedEvent = {
        "excludes": [
            {
                "name": "verbose-event",
                "ratio": "0.7"
            }
        ]
    };

    const extremeRatioedEvent = {
        "excludes": [
            {
                "name": "verbose-event",
                "ratio": "0.997" // exclude 99.7%, i.e keep 0.3%
            }
        ]
    };

    const fullyRatioedEvent = {
        "ratio": "0"
    }

    test('Should allow all events****', async () => {
        const config = new Configuration(all);
        let event = { event: "something", userId: "abcd"} as AnalyticsEvent;
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
            userId: "abcd",
            event: "identify",
         } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true);
        event = {
            userId: "abcd",
            event: "startup",
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false);
    });

    test('Should only allow errors', async () => {
        const config = new Configuration(errors);
        let event = {
            userId: "abcd",
            event: "startup",
         } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} shouldn't be sent`);
        event = {
            userId: "abcd",
            event: "failed-analysis",
            properties: {
                "error": "Ohoh, an error occurred!"
            }
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true, `${event.event} should be sent`);
        event = {
            userId: "abcd",
            event: "crash-analysis",
            properties: {
                "error": "Bla bla stackoverflow bla"
            }
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} shouldn't be sent`);
    });

    test('Should apply ratio on userId', async () => {
    // Generate test UUIDs
    // for (let index = 0; index < 20; index++) {
    //   const uuid = generateUUID();
    //   console.log(`${uuid} hashcode:${hashCode(uuid)} numvalue:${numValue(uuid)}`);
    // }

       /*
        6c4698ed-85f3-4448-9b0f-10897b8b4178 hashcode:349419899 numvalue:0.9899
        870c8e59-9299-437f-a4dd-5bd331352ec7 hashcode:-2018427608 numvalue:0.7608
        c020f453-6811-4545-a3aa-3c5cc17d6fe8 hashcode:-252979871 numvalue:0.9871
        db3f9e5e-2dd5-4d81-aac8-aa75333c105c hashcode:1140739481 numvalue:0.9481
        8abd3beb-c930-46a0-b244-7f1c6f9857da hashcode:82715988 numvalue:0.5988
        d839a99f-6afc-4309-bcb7-5d1e78eb0241 hashcode:1829289193 numvalue:0.9193
        08f87a61-077a-4cb3-b9f9-4e5751d4dc96 hashcode:1602451551 numvalue:0.1551
        72f09a0e-1fa6-46d1-8322-48ac0ffa4252 hashcode:-633581890 numvalue:0.189
        c1d68afc-a39e-4b89-bb95-e9d7684efe7c hashcode:-1103007680 numvalue:0.768
        a52ec11d-35bf-4579-88fd-72de5c6a0467 hashcode:158094785 numvalue:0.4785
        d136d7b4-518a-43b6-bb1d-1dafd9e1e52b hashcode:2110423401 numvalue:0.3401
        ddf95114-333d-41e0-b1ba-d84bc6293634 hashcode:1889783579 numvalue:0.3579
        fb833841-75de-435e-98d2-ab0988712340 hashcode:1464118621 numvalue:0.8621
        71f327fa-e8ed-4fdc-92d9-5de6a1f47229 hashcode:-367676488 numvalue:0.6488
        82b4c9f4-73e3-4e4a-b243-dc4aff91b9f6 hashcode:224204832 numvalue:0.4832
        16d122ec-9122-4392-a90f-71504ef40c6f hashcode:1020229945 numvalue:0.9945
        570447c7-168e-4d3d-be40-e5559dd4f86b hashcode:-690069930 numvalue:0.993
        cc4ee6ef-6862-4468-ac51-a64f237f84f5 hashcode:-1247454805 numvalue:0.4805
        b2ee8320-4dff-44a1-87e2-ca9daa9e24ed hashcode:-1381801037 numvalue:0.1037
        4e97382d-6042-4001-889d-ecc0cb4e8862 hashcode:-1911346601 numvalue:0.6601
       */

        const config = new Configuration(ratioed);
        let event = {
            userId: "8abd3beb-c930-46a0-b244-7f1c6f9857da", //numvalue:0.5988 > 0.3
            event: "startup"
         } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} shouldn't be sent`);
        event = {
            userId: "72f09a0e-1fa6-46d1-8322-48ac0ffa4252",//numvalue:0.189 < 0.3
            event: "startup",
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true, `${event.event} should be sent`);
        event = {
            userId: "ddf95114-333d-41e0-b1ba-d84bc6293634",//numvalue:0.3579 > 0.3
            event: "startup",
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} shouldn't be sent`);
    });

    test('Should apply ratio on event', async () => {
        const config = new Configuration(ratioedEvent);
        let event = {
            userId: "8668869d-a068-412b-9e59-4fec9dc0483a",
            event: "startup"
         } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true, `${event.event} should be sent`);

        event = {
            userId: "ceef2ce6-72e1-4ebf-9493-8df2d84b3eb9",
            event: "startup",
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true, `${event.event} should be sent`);

        event = {
            userId: "72f09a0e-1fa6-46d1-8322-48ac0ffa4252",//numvalue:0.189 < (1- 0.7)
            event: "verbose-event",
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true, `${event.event} should be sent`);


        event = {
            userId: "ddf95114-333d-41e0-b1ba-d84bc6293634",//numvalue:0.3579 > (1 - 0.7)
            event: "verbose-event",
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} should not be sent`);
    });


    test('Should exclude 99.7% of event', async () => {
    // Generate test UUIDs
    // const uuid = '';
    // var index = 0;
    // while (true) {
    //   index++;
    //   const uuid = generateUUID();
    //   const num = numValue(uuid);
    //   if (num <= 0.003) {
    //     console.log(`${uuid} hashcode:${hashCode(uuid)} numvalue:${numValue(uuid)} after ${index} tries`);
    //     //55ec5918-6f60-47a5-b46c-63d567d8e367 hashcode:-1247100023 numvalue:0.0023 after 263 tries
    //     break;
    //   }
    // }

        const config = new Configuration(extremeRatioedEvent);
        let event = {
            userId: "8668869d-a068-412b-9e59-4fec9dc0483a",
            event: "startup"
         } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true, `${event.event} should be sent`);

        event = {
            userId: "55ec5918-6f60-47a5-b46c-63d567d8e367",//numvalue:0.0023 < (1- 0.997)
            event: "verbose-event",
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === true, `${event.event} should be sent`);


        event = {
            userId: "72f09a0e-1fa6-46d1-8322-48ac0ffa4252",//numvalue:0.189 > (1 - 0.997)
            event: "verbose-event",
        } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} should not be sent`);
    });

    test('Should exclude 100.0% of events', async () => {
        const config = new Configuration(fullyRatioedEvent);
        let event = {
            userId: "f2cec861-8a0e-46cf-b385-08c7676e6e7e", // works out to a hash of ###0000, which means a ratio of 0
            event: "not-wanted-event"
            } as AnalyticsEvent;
        assert.ok(config.canSend(event) === false, `${event.event} shouldn't be sent`);
    });
});