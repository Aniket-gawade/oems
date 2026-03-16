package com.project.oems.contracts.architecture;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import org.junit.jupiter.api.Test;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

class ContractsModuleArchitectureTest {

    @Test
    void contractsModuleMustNotDependOnCommonOrSpringPackages() {
        JavaClasses classes = new ClassFileImporter().importPackages("com.project.oems.contracts");

        noClasses()
            .that()
            .resideInAnyPackage("com.project.oems.contracts..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage(
                "com.project.oems.common..",
                "org.springframework..",
                "org.springframework.boot.."
            )
            .check(classes);
    }
}
