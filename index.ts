import "reflect-metadata";

const decorateClass = (target: Function) => {
	const constructor = target;

	function construct(sourceConstructor, args) {
		const base: any = function() {
			return sourceConstructor.apply(this, args);
		};

		base.prototype = constructor.prototype;

		return new base();
	}

	const override: any = function(...args) {
		console.log("Class has been called", constructor["name"]);
		return construct(constructor, args);
	};

	override.prototype = constructor.prototype;

	return override;
};

function decorateClassAlt<T extends { new (...args: any[]): {} }>(constructor: T) {
	const override = class extends constructor {
		newProperty = "new property";
		hello = "override";
	};

	override.prototype = constructor.prototype;

	return override;
}

const decorateMethod = (target: Object, propertyName: string, propertyDescriptor: PropertyDescriptor) => {
	const method = propertyDescriptor.value;

	console.log("type", Reflect.getMetadata("design:paramtypes", target, propertyName));

	const modified = function(...args: any[]) {
		const base = method.apply(this, args);
		return JSON.stringify(base);
	};

	propertyDescriptor.value = modified;

	return propertyDescriptor;
};

const decorateProperty = (target: Object, propertyName: string) => {
	let value = target[propertyName];

	console.log("propertyType", Reflect.getMetadata("design:type", target, propertyName));

	const getter = () => {
		console.log("getting");
		return `First name is ${value}`;
	};

	const setter = newValue => {
		console.log("setting");
		value = newValue;
	};

	if (delete target[propertyName]) {
		Object.defineProperty(target, propertyName, {
			get: getter,
			set: setter,
			enumerable: true,
			configurable: true
		});
	}
};

const decorateParameter = () => {};

interface ITeam {
	name: string;
	players: number;
}

interface IPerson {
	firstName: string;
	lastName: string;
	team?: ITeam;
	greet: () => void;
}

@decorateClass
// @decorateClassAlt
class Person implements IPerson {
	firstName: string;
	lastName: string;

	@decorateProperty
	team?: ITeam;

	@decorateMethod
	greet() {
		return {
			sample: "Hello",
			sampleAgain: "World"
		};
	}

	/**
	 *
	 */
	constructor(dto: Partial<Person> = {}) {
		this.firstName = dto.firstName;
		this.lastName = dto.lastName;
	}
}

const human = new Person({ firstName: "Seun", lastName: "Adedire" });
console.log("here", human.greet());
