package com.jadeguard;

import static org.assertj.core.api.Assertions.assertThat;

import com.jadeguard.common.SystemController;
import org.junit.jupiter.api.Test;

class JadeGuardApplicationTests {

    @Test
    void healthEndpointReportsServiceUp() {
        var response = new SystemController().health();

        assertThat(response)
                .containsEntry("service", "jadeguard-backend")
                .containsEntry("status", "UP");
    }
}
