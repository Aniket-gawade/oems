package com.project.oems.oemsapi.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
public class StartupLogConfiguration {

    private static final Logger log = LoggerFactory.getLogger(StartupLogConfiguration.class);

    @EventListener(ApplicationReadyEvent.class)
    public void logStartupContext(ApplicationReadyEvent event) {
        Environment environment = event.getApplicationContext().getEnvironment();
        String[] profiles = environment.getActiveProfiles();
        String activeProfiles = profiles.length == 0 ? "default" : String.join(",", profiles);
        String port = environment.getProperty("local.server.port",
                environment.getProperty("server.port", "8080"));

        log.info("OEMS API startup complete. activeProfiles={} port={}", activeProfiles, port);
    }
}
