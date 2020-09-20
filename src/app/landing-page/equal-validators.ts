import { AbstractControl, ValidationErrors } from '@angular/forms';

export class EqualValidator {

    public static validateConfirm(control: AbstractControl): ValidationErrors | null {

        let c = control.value;

        let p = control.root.get("password")

        // value not equal
        if (c && c !== p.value) return {
            validateEqual: true
        }

        return null;
    }
}