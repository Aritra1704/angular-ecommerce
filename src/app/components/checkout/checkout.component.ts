import { JsonPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupName, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { EcommerceFormService } from 'src/app/services/ecommerce-form.service';
import { EcommerceValidators } from 'src/app/validators/ecommerce-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;
  
  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder,
    private ecommerceFormService: EcommerceFormService) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required, 
          Validators.minLength(2),
          EcommerceValidators.notOnlyWhiteSpace]),
        lastName: new FormControl('', [
          Validators.required, 
          Validators.minLength(2),
          EcommerceValidators.notOnlyWhiteSpace]),
        email: new FormControl('', [
          Validators.required, 
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipcode: [''],
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipcode: [''],
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
      }),
    });

    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1;
    this.ecommerceFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: "+JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
    
    // populate credit card years
    this.ecommerceFormService.getCreditCardYears().subscribe(
      data => {
        console.log("Retrieved credit card years: "+JSON.stringify(data));
        this.creditCardYears = data;
      }
    );
    
    //populate countries
    this.ecommerceFormService.getCountries().subscribe(
      data => {
        console.log("Retrieved countries: "+JSON.stringify(data));
        this.countries = data;
      }
    );
  }

  onSubmit() {
    console.log("Handling the submit button");

    if(this.checkoutFormGroup.invalid) {
      console.log(`this.checkoutFormGroup.invalid: ${this.checkoutFormGroup.invalid}`)
      this.checkoutFormGroup.markAllAsTouched();
    }
    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log("The email address is: "+this.checkoutFormGroup.get('customer')?.value.email);
    
    console.log("The shipping address country is: "+this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log("The shipping address state is: "+this.checkoutFormGroup.get('shippingAddress')?.value.state.name);
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }

  copyShippingAddressToBillingAddress(event: Event) {
    const isChecked = (<HTMLInputElement>event.target).checked;
    if(isChecked) {
      this.checkoutFormGroup.controls['billingAddress']
        .setValue(this.checkoutFormGroup.controls['shippingAddress'].value);

      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  // Function to handle if user selects future year then month should begin with 1
  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    let startMonth: number;

    if(currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.ecommerceFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log("Retrieved credit card months: "+JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
  }

  getStates(shippingAddress: string) {
    const formGroup = this.checkoutFormGroup.get(shippingAddress);
    const countryCode = formGroup?.value.country.code;
    const countryName = formGroup?.value.country.name;

    console.log(`${shippingAddress} country code: ${countryCode}`);
    console.log(`${shippingAddress} country code: ${countryName}`);

    this.ecommerceFormService.getStates(countryCode).subscribe(
      data => {
        if(shippingAddress === 'shippingAddress') {
          this.shippingAddressStates = data;
        }  else {
          this.billingAddressStates = data;
        }

        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }
}
