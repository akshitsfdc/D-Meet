import { AbstractControl, ValidationErrors } from '@angular/forms';

export class LengthValidators {

    constructor(private minLength, private maxlength) { }

    public static lengthRestriction(control: AbstractControl): ValidationErrors | null {

        if ((control.value as string).length < 6) {
            return {
                invalidLength: true,
                requiredLength: 5
            }
        }

        return null;
    }

    public static required(control: AbstractControl): ValidationErrors | null {

        if ((control.value as string).length <= 0) {
            return { emptyText: true }
        }

        return null;
    }
}